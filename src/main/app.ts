import { Config, ProcessEnvConfig } from '@nodescript/config';
import { HttpServer } from '@nodescript/http-server';
import { Logger } from '@nodescript/logger';
import { dep, Mesh } from '@nodescript/mesh';
import { BaseApp, StandardLogger } from '@nodescript/microservice';

import { FetchDomainImpl } from './domains/fetch.js';
import { FetchProtocolHandler, FetchProtocolImpl } from './handler.js';
import { FetchCurlService } from './services/fetch.curl.js';
import { FetchService } from './services/fetch.js';

export class App extends BaseApp {

    @dep() httpServer!: HttpServer;

    constructor() {
        super(new Mesh('App'));
        this.mesh.constant('httpRequestScope', () => this.createRequestScope());
        this.mesh.service(Config, ProcessEnvConfig);
        this.mesh.service(Logger, StandardLogger);
        this.mesh.service(HttpServer);
    }

    protected createRequestScope() {
        const mesh = new Mesh('Request');
        mesh.parent = this.mesh;
        mesh.service(FetchProtocolHandler);
        mesh.service(FetchDomainImpl);
        mesh.service(FetchProtocolImpl);
        mesh.service(FetchService, FetchCurlService);
        return mesh;
    }

    async start() {
        this.httpServer.addRequestHandler(FetchProtocolHandler);
        await this.httpServer.start();
    }

    async stop() {
        await this.httpServer.stop();
    }

}
