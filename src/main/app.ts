import { HttpCorsHandler, HttpMetricsHandler, HttpServer, StandardHttpHandler } from '@nodescript/http-server';
import { Logger } from '@nodescript/logger';
import { BaseApp, StandardLogger } from '@nodescript/microservice';
import { Config, ProcessEnvConfig } from 'mesh-config';
import { dep, Mesh } from 'mesh-ioc';

import { AppHttpHandler } from './AppHttpHandler.js';
import { FetchDomainImpl } from './FetchDomainImpl.js';
import { FetchProtocolHandler } from './FetchProtocolHandler.js';
import { FetchProtocolImpl } from './FetchProtocolImpl.js';
import { FetchCurlService } from './FetchService.curl.js';
import { FetchService } from './FetchService.js';
import { HttpFetchHandler } from './HttpFetchHandler.js';
import { Metrics } from './Metrics.js';

export class App extends BaseApp {

    @dep() httpServer!: HttpServer;

    constructor() {
        super(new Mesh('App'));
        this.mesh.constant(HttpServer.SCOPE, () => this.createRequestScope());
        this.mesh.service(Config, ProcessEnvConfig);
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
        mesh.service(FetchProtocolHandler);
        mesh.service(FetchDomainImpl);
        mesh.service(FetchProtocolImpl);
        mesh.service(FetchService, FetchCurlService);
        return mesh;
    }

    async start() {
        await this.httpServer.start();
    }

    async stop() {
        await this.httpServer.stop();
    }

}
