import { HttpServer } from '@nodescript/http-server';
import { BaseApp } from '@nodescript/microframework';
import { dep, Mesh } from 'mesh-ioc';

import { FetchHandler } from './global/FetchHandler.js';
import { MainHttpServer } from './global/MainHttpServer.js';

export class App extends BaseApp {

    @dep() private httpServer!: HttpServer;

    constructor() {
        super(new Mesh('App'));
        this.mesh.service(HttpServer, MainHttpServer);
        this.mesh.service(FetchHandler);
    }

    override async start() {
        await super.start();
        await this.httpServer.start();
    }

    override async stop() {
        await super.stop();
        await this.httpServer.stop();
    }

}
