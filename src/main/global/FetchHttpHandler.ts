import { HttpChain, HttpCorsHandler, HttpHandler, HttpMetricsHandler, StandardHttpHandler } from '@nodescript/http-server';
import { dep } from 'mesh-ioc';

import { ForwardRequestHandler } from './ForwardRequestHandler.js';

export class FetchHttpHandler extends HttpChain {

    @dep() private standardHttpHandler!: StandardHttpHandler;
    @dep() private corsHandler!: HttpCorsHandler;
    @dep() private metricsHandler!: HttpMetricsHandler;
    @dep() private forwardRequestHandler!: ForwardRequestHandler;

    private corsConfigHandler: HttpHandler = {
        async handle(ctx, next) {
            ctx.state.corsExposeHeaders = 'Content-Length,Date,X-Fetch-Status,X-Fetch-Headers';
            ctx.state.corsAllowCredentials = false;
            await next();
        },
    };

    handlers: HttpHandler[] = [
        this.standardHttpHandler,
        this.corsConfigHandler,
        this.corsHandler,
        this.metricsHandler,
        this.forwardRequestHandler,
    ];

}
