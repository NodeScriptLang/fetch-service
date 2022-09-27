import { Config, ProcessEnvConfig } from '@flexent/config';
import { CreateRequestScope } from '@flexent/http-server';
import { Logger } from '@flexent/logger';
import { Mesh } from '@flexent/mesh';

import { FetchDomainImpl } from './domains/fetch.js';
import { FetchProtocolHandler, FetchProtocolImpl, HttpServer } from './http-server.js';
import { StandardLogger } from './logger.js';
import { FetchCurlService } from './services/fetch.curl.js';
import { FetchService } from './services/fetch.js';

export class App {
    mesh: Mesh;

    constructor() {
        this.mesh = new Mesh('App');
        this.mesh.constant('App', this);
        this.mesh.constant<CreateRequestScope>('requestScope', () => this.createRequestScope());
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

    async start() {}

    async stop() {}

    get logger() {
        return this.mesh.resolve(Logger);
    }

    get httpServer() {
        return this.mesh.resolve(HttpServer);
    }

}
