import { HttpCorsHandler, HttpMetricsHandler, HttpServer, StandardHttpHandler } from '@nodescript/http-server';
import { Logger } from '@nodescript/logger';
import { BaseApp, StandardLogger } from '@nodescript/microframework';
import { Config } from 'mesh-config';
import { dep, Mesh } from 'mesh-ioc';

import { AppConfig } from './AppConfig.js';
import { FetchHttpHandler } from './FetchHttpHandler.js';
import { FetchHttpServer } from './FetchHttpServer.js';
import { ForwardRequestHandler } from './ForwardRequestHandler.js';
import { Metrics } from './Metrics.js';

export class App extends BaseApp {

    @dep() private httpServer!: HttpServer;

    constructor() {
        super(new Mesh('App'));
        this.mesh.service(Config, AppConfig);
        this.mesh.service(Logger, StandardLogger);
        this.mesh.service(HttpServer, FetchHttpServer);
        this.mesh.service(Metrics);
        this.mesh.service(FetchHttpHandler);
        this.mesh.service(HttpMetricsHandler);
        this.mesh.service(StandardHttpHandler);
        this.mesh.service(HttpCorsHandler);
        this.mesh.service(ForwardRequestHandler);
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
