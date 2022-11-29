import { config } from '@nodescript/config';
import { FetchHeaders, FetchRequest, FetchResponse } from '@nodescript/fetch-protocol';
import { Logger } from '@nodescript/logger';
import { dep } from '@nodescript/mesh';
import { spawn } from 'child_process';

import { FetchService } from './fetch.js';

export class FetchCurlService extends FetchService {

    @dep() logger!: Logger;
    @config({ default: 'curl' }) CURL_PATH!: string;

    async sendRequest(request: FetchRequest): Promise<FetchResponse> {
        const startedAt = Date.now();
        const args = this.prepareArgs(request);
        const child = spawn(this.CURL_PATH, args, {
            stdio: 'pipe',
        });
        if (this.supportsBody(request.method)) {
            const { bodyBase64 } = request;
            const requestBody = bodyBase64 ? Buffer.from(bodyBase64, 'base64') : Buffer.alloc(0);
            child.stdin.write(requestBody);
            child.stdin.end();
        }
        const [stdout, stderr] = await Promise.all([
            this.readStream(child.stdout),
            this.readStream(child.stderr),
        ]);
        const { headers: responseHeaders, info } = this.parseStderr(stderr);
        const duration = Date.now() - startedAt;
        this.logger.info('Request served', {
            url: request.url,
            status: info.response_code,
            size: stdout.byteLength,
            duration,
        });
        return {
            status: info.response_code,
            headers: responseHeaders,
            bodyBase64: stdout.toString('base64'),
            url: info.url_effective,
        };
    }

    private supportsBody(method: string) {
        return method === 'POST' || method === 'PUT';
    }

    private prepareArgs(request: FetchRequest) {
        const { method, headers } = request;
        const args = [
            '-X', method,
            // Tell curl to emit response info and response headers into stderr
            // in JSON format, so that we can parse them
            '-w', '%{stderr}%{json}||||%{header_json}',
            // Since we're reading from stderr, we need curl to not emit extra noise
            '--silent',
        ];
        args.push(...this.getHeaderArgs(headers));
        if (this.supportsBody(method)) {
            // We will push request body into stdin, so curl needs to read from it
            args.push('--data-binary', '@-');
        }
        if (request.followRedirects !== false) {
            args.push('-L');
        }
        if (request.proxy) {
            args.push('-x', request.proxy);
        }
        args.push(request.url);
        return args;
    }

    private getHeaderArgs(headers: FetchHeaders) {
        const args: string[] = [];
        for (const [key, values] of Object.entries(headers)) {
            for (const value of values) {
                args.push('-H');
                args.push(`${key}: ${value}`);
            }
        }
        return args;
    }

    private async readStream(stream: NodeJS.ReadableStream) {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk as Buffer);
        }
        return Buffer.concat(chunks);
    }

    private parseStderr(stderr: Buffer): { headers: FetchHeaders; info: CurlResponseInfo } {
        const str = stderr.toString('utf-8');
        const [infoText, headersText] = str.split('||||');
        return {
            headers: JSON.parse(headersText),
            info: JSON.parse(infoText),
        };
    }

}

interface CurlResponseInfo {
    'url_effective': string;
    'response_code': number;
}
