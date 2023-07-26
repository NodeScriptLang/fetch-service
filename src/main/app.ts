import { HttpCorsHandler, HttpMetricsHandler, HttpServer, StandardHttpHandler } from '@nodescript/http-server';
import { Logger } from '@nodescript/logger';
import { BaseApp, StandardLogger } from '@nodescript/microservice';
import { Config } from 'mesh-config';
import { dep, Mesh } from 'mesh-ioc';

import { AppConfig } from './AppConfig.js';
import { AppHttpHandler } from './AppHttpHandler.js';
import { HttpFetchHandler } from './HttpFetchHandler.js';
import { Metrics } from './Metrics.js';

export class App extends BaseApp {

    @dep() private httpServer!: HttpServer;

    constructor() {
        super(new Mesh('App'));
        this.mesh.constant(HttpServer.SCOPE, () => this.createRequestScope());
        this.mesh.service(Config, AppConfig);
        this.mesh.service(Logger, StandardLogger);
        this.mesh.service(HttpServer);
        this.mesh.service(Metrics);
        this.mesh.service(HttpMetricsHandler);
        this.mesh.service(StandardHttpHandler);
        this.mesh.service(HttpCorsHandler);
        this.mesh.service(HttpFetchHandler);
    }

    createRequestScope() {
        const mesh = new Mesh('Request');
        mesh.parent = this.mesh;
        mesh.service(HttpServer.HANDLER, AppHttpHandler);
        return mesh;
    }

    async start() {
        await this.httpServer.start();
    }

    async stop() {
        await this.httpServer.stop();
    }

}
