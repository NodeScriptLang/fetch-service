import { HttpContext, HttpRoute, HttpRouter } from '@nodescript/http-server';
import { Logger } from '@nodescript/logger';
import { CounterMetric, HistogramMetric, metric } from '@nodescript/metrics';
import { unifiedFetch } from '@nodescript/unified-fetch/backend';
import { FetchRequestSpecSchema } from '@nodescript/unified-fetch/schema';
import { FetchMethod, FetchRequestSpec } from '@nodescript/unified-fetch/types';
import { dep } from 'mesh-ioc';

import { parseJson } from '../util.js';

export class FetchHandler extends HttpRouter {

    @dep() private logger!: Logger;

    @metric()
    private requestLatency = new HistogramMetric<{
        status: number;
        method: string;
        hostname: string;
        error?: string;
    }>('nodescript_fetch_service_request_latency', 'NodeScript Fetch Service request latency');

    @metric()
    private responseSize = new CounterMetric<{
        status: number;
        method: string;
        hostname: string;
    }>('nodescript_fetch_service_response_size', 'NodeScript Fetch Service response size');

    @metric()
    private errors = new CounterMetric<{
        error: string;
        code: string;
    }>('nodescript_fetch_service_errors_total', 'NodeScript Fetch Service errors');

    routes: HttpRoute[] = [
        ['POST', `/request`, ctx => this.handleRequest(ctx)],
    ];

    async handleRequest(ctx: HttpContext) {
        try {
            const req = this.parseRequestSpec(ctx);
            const res = await unifiedFetch(req, ctx.request);
            ctx.status = 200;
            ctx.addResponseHeaders({
                'x-fetch-status': [String(res.status)],
                'x-fetch-headers': [JSON.stringify(res.headers)],
            });
            ctx.responseBody = res.body;
            const size = Number(res.headers['content-length']) || 0;
            this.logger.info('Request served', {
                url: req.url,
                status: res.status,
                size,
            });
            this.requestLatency.addMillis(Date.now() - ctx.startedAt, {
                status: res.status,
                method: req.method,
                hostname: this.tryParseHostname(req.url),
            });
            this.responseSize.incr(size, {
                status: res.status,
                method: req.method,
                hostname: this.tryParseHostname(req.url),
            });
        } catch (error: any) {
            error.stack = '';
            this.errors.incr(1, {
                error: error.name,
                code: error.code,
            });
            throw error;
        }
    }

    private parseRequestSpec(ctx: HttpContext): FetchRequestSpec {
        return FetchRequestSpecSchema.create({
            method: ctx.getRequestHeader('x-fetch-method') as FetchMethod,
            url: ctx.getRequestHeader('x-fetch-url'),
            headers: parseJson(ctx.getRequestHeader('x-fetch-headers'), {}),
            followRedirects: ctx.getRequestHeader('x-fetch-follow-redirects') !== 'false',
            proxy: ctx.getRequestHeader('x-fetch-proxy', '') || undefined,
            connectOptions: parseJson(ctx.getRequestHeader('x-fetch-connect-options', ''), {}),
        });
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
