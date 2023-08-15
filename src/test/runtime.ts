import { dep } from 'mesh-ioc';

import { App } from '../main/app.js';
import { TestHttpServer } from './test-server.js';

export class TestRuntime {
    app = new App();

    @dep({ cache: false }) testHttpServer!: TestHttpServer;

    async setup() {
        this.app = new App();
        this.app.mesh.connect(this);
        this.app.mesh.service(TestHttpServer);
        await this.app.start();
        await this.testHttpServer.start();
    }

    async teardown() {
        await this.app.stop();
        await this.testHttpServer.stop();
    }

    get baseUrl() {
        return `http://localhost:${process.env.HTTP_PORT ?? '8080'}`;
    }

}

export const runtime = new TestRuntime();
