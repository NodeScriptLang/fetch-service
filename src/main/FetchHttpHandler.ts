import { HttpChain, HttpCorsHandler, HttpHandler, HttpMetricsHandler, StandardHttpHandler } from '@nodescript/http-server';
import { dep } from 'mesh-ioc';

import { ForwardRequestHandler } from './ForwardRequestHandler.js';

export class FetchHttpHandler extends HttpChain {

    @dep() private standardHttpHandler!: StandardHttpHandler;
    @dep() private corsHandler!: HttpCorsHandler;
    @dep() private metricsHandler!: HttpMetricsHandler;
    @dep() private forwardRequestHandler!: ForwardRequestHandler;

    handlers: HttpHandler[] = [
        this.standardHttpHandler,
        this.corsHandler,
        this.metricsHandler,
        this.forwardRequestHandler,
    ];

}
