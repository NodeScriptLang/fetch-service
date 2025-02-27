import { FetchRequestSpecSchema } from '@nodescript/core/schema';
import { FetchMethod, FetchRequestSpec } from '@nodescript/core/types';
import { fetchUndici } from '@nodescript/fetch-undici';
import { HttpContext, HttpRoute, HttpRouter } from '@nodescript/http-server';
import { Logger } from '@nodescript/logger';
import { CounterMetric, HistogramMetric, metric } from '@nodescript/metrics';
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
            // Handle special case where content-type is set in the header by the browser
            const contentType = ctx.getRequestHeader('content-type');
            if (contentType && !req.headers['content-type']) {
                req.headers['content-type'] = contentType;
            }
            const res = await fetchUndici(req, ctx.request);
            const latency = Date.now() - ctx.startedAt;
            ctx.status = 200;
            ctx.addResponseHeaders({
                'x-fetch-status': [String(res.status)],
                'x-fetch-headers': [JSON.stringify(res.headers)],
                'x-latency-ms': [latency.toString()],
            });
            ctx.responseBody = res.body;
            const size = Number(res.headers['content-length']) || 0;
            this.logger.info('Request served', {
                url: req.url,
                status: res.status,
                size,
            });
            this.requestLatency.addMillis(latency, {
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
            timeout: Number(ctx.getRequestHeader('x-fetch-timeout', '')) || undefined,
            connectOptions: parseJson(ctx.getRequestHeader('x-fetch-connect-options', ''), {}),
        });
    }

    private tryParseHostname(url: string) {
        try {
            const { hostname } = new URL(url);
            return hostname;
        } catch (_err) {
            return '<invalid url>';
        }
    }

}
