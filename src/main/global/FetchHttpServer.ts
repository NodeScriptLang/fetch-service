import { HttpContext, HttpNext, HttpServer } from '@nodescript/http-server';
import { dep } from 'mesh-ioc';

import { FetchHttpHandler } from './FetchHttpHandler.js';

export class FetchHttpServer extends HttpServer {

    @dep() private handler!: FetchHttpHandler;

    async handle(ctx: HttpContext, next: HttpNext) {
        await this.handler.handle(ctx, next);
    }

}
