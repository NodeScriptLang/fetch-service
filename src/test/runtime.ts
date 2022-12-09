import { dep, Mesh } from '@nodescript/mesh';
import { config } from 'dotenv';

import { App } from '../main/app.js';
import { FetchDomainImpl } from '../main/domains/fetch.js';
import { TestHttpServer } from './test-server.js';

config({ path: '.env' });
config({ path: '.env.test' });

export class TestRuntime {
    app = new App();
    requestScope: Mesh = new Mesh();

    @dep({ cache: false }) Fetch!: FetchDomainImpl;
    @dep({ cache: false }) testHttpServer!: TestHttpServer;

    async setup() {
        this.app = new App();
        this.requestScope = this.app.createRequestScope();
        this.requestScope.connect(this);
        this.app.mesh.service(TestHttpServer);

        await this.app.start();
        await this.testHttpServer.start();
    }

    async teardown() {
        await this.app.stop();
        await this.testHttpServer.stop();
    }

    get baseUrl() {
        return `http://localhost:${process.env.PORT ?? '8080'}`;
    }

}

export const runtime = new TestRuntime();
