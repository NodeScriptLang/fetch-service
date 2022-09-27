import { config } from 'dotenv';

import { App } from '../main/app.js';
import { FetchDomainImpl } from '../main/domains/fetch.js';
import { FetchCurlService } from '../main/services/fetch.curl.js';
import { FetchService } from '../main/services/fetch.js';
import { TestHttpServer } from './test-server.js';

config({ path: '.env' });
config({ path: '.env.test' });

export class TestRuntime {
    app = new App();

    async setup() {
        this.app = new App();
        this.app.mesh.service(TestHttpServer);
        this.app.mesh.service(FetchService, FetchCurlService);
        this.app.mesh.service(FetchDomainImpl);
        await this.app.start();
        await this.testHttpServer.start();
    }

    async teardown() {
        await this.app.stop();
        await this.testHttpServer.stop();
    }

    get testHttpServer() {
        return this.app.mesh.resolve(TestHttpServer);
    }

    get Fetch() {
        return this.app.mesh.resolve(FetchDomainImpl);
    }

    get baseUrl() {
        return `http://localhost:${process.env.PORT ?? '8080'}`;
    }

}

export const runtime = new TestRuntime();
