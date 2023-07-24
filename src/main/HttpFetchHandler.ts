import { FetchMethod } from '@nodescript/adapter-fetch-protocol';
import { HttpContext, HttpRoute, HttpRouter } from '@nodescript/http-server';
import { Logger } from '@nodescript/logger';
import { config } from 'mesh-config';
import { dep } from 'mesh-ioc';
import { getGlobalDispatcher, ProxyAgent, request } from 'undici';

import { FetchHeaders } from '../schema/FetchHeaders.js';
import { FetchRequestSpec, FetchRequestSpecSchema } from '../schema/FetchRequestSpec.js';
import { Metrics } from './Metrics.js';
import { parseJson } from './util.js';

export class HttpFetchHandler extends HttpRouter {

    @config({ default: '' })
    FETCH_PREFIX!: string;

    @dep() private logger!: Logger;
    @dep() private metrics!: Metrics;

    routes: HttpRoute[] = [
        ['POST', `${this.FETCH_PREFIX}/request`, ctx => this.sendRequest(ctx)],
    ];

    async sendRequest(ctx: HttpContext) {
        const {
            method,
            url,
            headers,
            followRedirects,
            proxy,
        } = this.parseRequestSpec(ctx);
        try {
            const dispatcher = proxy ? new ProxyAgent({ uri: proxy }) : getGlobalDispatcher();
            const maxRedirections = followRedirects ? undefined : 0;
            const res = await request(url, {
                dispatcher,
                method,
                headers: prepHeaders({
                    'user-agent': 'NodeScript / Iso Fetch v1',
                    ...headers
                }),
                body: ctx.request,
                maxRedirections,
            });
            ctx.status = 200;
            ctx.addResponseHeaders({
                'x-fetch-status': [String(res.statusCode)],
                'x-fetch-headers': [JSON.stringify(res.headers)],
            });
            ctx.responseBody = res.body;
            this.logger.info('Request served', {
                url,
                status: res.statusCode,
            });
            // TODO add metrics
        } catch (error) {
            this.logger.error('Request failed', { error });
            // TODO add metrics
            throw error;
        }
    }

    private parseRequestSpec(ctx: HttpContext): FetchRequestSpec {
        return FetchRequestSpecSchema.create({
            method: ctx.getRequestHeader('x-fetch-method') as FetchMethod,
            url: ctx.getRequestHeader('x-fetch-url'),
            headers: parseJson(ctx.getRequestHeader('x-fetch-headers'), {}),
            followRedirects: ctx.getRequestHeader('x-fetch-follow-redirects') === 'true',
            proxy: ctx.getRequestHeader('x-fetch-proxy', '') || undefined,
        });
    }

}

function prepHeaders(headers: Record<string, string | string[] | undefined>) {
    const result: FetchHeaders = {};
    for (const [k, v] of Object.entries(headers)) {
        if (v == null) {
            continue;
        }
        result[k.toLowerCase()] = Array.isArray(v) ? v.map(_ => String(_)) : [v];
    }
    return result;
}
