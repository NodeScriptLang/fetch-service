import { HttpContext, HttpRoute, HttpRouter } from '@nodescript/http-server';
import { Logger } from '@nodescript/logger';
import { dep } from 'mesh-ioc';
import { Agent, Dispatcher, getGlobalDispatcher, ProxyAgent, request } from 'undici';

import { FetchMethod } from '../../schema/FetchMethod.js';
import { FetchRequestSpec, FetchRequestSpecSchema } from '../../schema/FetchRequestSpec.js';
import { parseJson } from '../util.js';
import { Metrics } from './Metrics.js';

export class FetchHandler extends HttpRouter {

    @dep() private logger!: Logger;
    @dep() private metrics!: Metrics;

    routes: HttpRoute[] = [
        ['POST', `/request`, ctx => this.handleRequest(ctx)],
    ];

    async handleRequest(ctx: HttpContext) {
        const {
            method,
            url,
            headers,
            followRedirects,
            proxy,
            connectOptions,
        } = this.parseRequestSpec(ctx);
        try {
            const dispatcher = this.getDispatcher({ proxy, connectOptions });
            const maxRedirections = followRedirects ? 10 : 0;
            const reqHeaders = prepHeaders({
                'user-agent': 'NodeScript / Fetch v1',
                ...headers
            });
            const res = await request(url, {
                dispatcher,
                method,
                headers: reqHeaders,
                body: ctx.request,
                maxRedirections,
            });
            const size = Number(res.headers['content-length']) || 0;
            ctx.status = 200;
            ctx.addResponseHeaders({
                'x-fetch-status': [String(res.statusCode)],
                'x-fetch-headers': [JSON.stringify(res.headers)],
            });
            ctx.responseBody = res.body;
            this.logger.info('Request served', {
                url,
                status: res.statusCode,
                size,
            });
            this.metrics.requestLatency.addMillis(Date.now() - ctx.startedAt, {
                status: res.statusCode,
                method,
                hostname: this.tryParseHostname(url),
            });
            this.metrics.responseSize.incr(size, {
                status: res.statusCode,
                method,
                hostname: this.tryParseHostname(url),
            });
        } catch (error: any) {
            error.stack = '';
            this.metrics.errors.incr(1, {
                error: error.name,
                code: error.code,
            });
            this.logger.warn('Request failed', { error });
            throw new FetchError(error.message, error.code);
        }
    }

    private parseRequestSpec(ctx: HttpContext): FetchRequestSpec {
        return FetchRequestSpecSchema.create({
            method: ctx.getRequestHeader('x-fetch-method') as FetchMethod,
            url: ctx.getRequestHeader('x-fetch-url'),
            headers: parseJson(ctx.getRequestHeader('x-fetch-headers'), {}),
            followRedirects: ctx.getRequestHeader('x-fetch-follow-redirects') !== 'false',
            proxy: ctx.getRequestHeader('x-fetch-proxy', '') || undefined,
            retries: Number(ctx.getRequestHeader('x-fetch-retries', '')) || 1,
            connectOptions: parseJson(ctx.getRequestHeader('x-fetch-connect-options', ''), {}),
        });
    }

    private getDispatcher(opts: { proxy?: string; connectOptions: object }): Dispatcher {
        if (opts.proxy) {
            const proxyUrl = new URL(opts.proxy);
            const auth = (proxyUrl.username || proxyUrl.password) ?
                this.makeBasicAuth(proxyUrl.username, proxyUrl.password) : undefined;
            return new ProxyAgent({
                uri: opts.proxy,
                token: auth,
                connect: {
                    ...opts.connectOptions
                },
            });
        }
        if (Object.keys(opts.connectOptions).length > 0) {
            return new Agent({
                connect: {
                    ...opts.connectOptions,
                },
            });
        }
        return getGlobalDispatcher();
    }

    private makeBasicAuth(username: string, password: string) {
        return `Basic ${Buffer.from(username + ':' + password).toString('base64')}`;
    }

    private tryParseHostname(url: string) {
        try {
            const { hostname } = new URL(url);
            return hostname;
        } catch (error) {
            return '<invalid url>';
        }
    }

}

function prepHeaders(headers: Record<string, string | string[] | undefined>) {
    const result: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(headers)) {
        if (v == null) {
            continue;
        }
        result[k.toLowerCase()] = v;
    }
    return result;
}

export class FetchError extends Error {
    override name = this.constructor.name;
    status = 500;
    details = {};

    constructor(message: string, code?: string) {
        super(message || code || 'Request failed');
        this.details = {
            code,
        };
        this.stack = '';
    }
}
