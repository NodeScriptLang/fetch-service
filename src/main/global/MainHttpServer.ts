import { HttpChain, HttpContext, HttpCorsHandler, HttpErrorHandler, HttpHandler, HttpMetricsHandler, HttpNext, HttpServer, HttpStatusHandler } from '@nodescript/http-server';
import { dep } from 'mesh-ioc';

import { FetchHandler } from './FetchHandler.js';

export class MainHttpServer extends HttpServer {

    @dep() private errorHandler!: HttpErrorHandler;
    @dep() private corsHandler!: HttpCorsHandler;
    @dep() private metricsHandler!: HttpMetricsHandler;
    @dep() private statusHandler!: HttpStatusHandler;
    @dep() private forwardRequestHandler!: FetchHandler;

    private corsConfigHandler: HttpHandler = {
        async handle(ctx, next) {
            ctx.state.corsExposeHeaders = 'Content-Length,Date,X-Fetch-Status,X-Fetch-Headers';
            ctx.state.corsAllowCredentials = false;
            await next();
        },
    };

    private handler = new HttpChain([
        this.errorHandler,
        this.metricsHandler,
        this.statusHandler,
        this.corsConfigHandler,
        this.corsHandler,
        this.forwardRequestHandler,
    ]);

    async handle(ctx: HttpContext, next: HttpNext) {
        await this.handler.handle(ctx, next);
    }

}
