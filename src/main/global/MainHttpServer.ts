import { HttpChain, HttpContext, HttpCorsHandler, HttpHandler, HttpMetricsHandler, HttpNext, HttpServer, StandardHttpHandler } from '@nodescript/http-server';
import { dep } from 'mesh-ioc';

import { FetchHandler } from './FetchHandler.js';

export class MainHttpServer extends HttpServer {

    @dep() private standardHttpHandler!: StandardHttpHandler;
    @dep() private corsHandler!: HttpCorsHandler;
    @dep() private metricsHandler!: HttpMetricsHandler;
    @dep() private forwardRequestHandler!: FetchHandler;

    private corsConfigHandler: HttpHandler = {
        async handle(ctx, next) {
            ctx.state.corsExposeHeaders = 'Content-Length,Date,X-Fetch-Status,X-Fetch-Headers';
            ctx.state.corsAllowCredentials = false;
            await next();
        },
    };

    private handler = new HttpChain([
        this.standardHttpHandler,
        this.corsConfigHandler,
        this.corsHandler,
        this.metricsHandler,
        this.forwardRequestHandler,
    ]);

    async handle(ctx: HttpContext, next: HttpNext) {
        await this.handler.handle(ctx, next);
    }

}
