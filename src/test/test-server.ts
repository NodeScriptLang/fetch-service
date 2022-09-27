import { createServer, RequestListener } from 'http';

const port = process.env.TEST_SERVER_PORT || '8099';

export class TestHttpServer {

    server = createServer((req, res) => this.requestHandler(req, res));

    requestHandler: RequestListener = (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{}');
    };

    async start() {
        await new Promise<void>(resolve => this.server.listen(port, resolve));
    }

    async stop() {
        await new Promise(resolve => {
            this.server.closeAllConnections();
            this.server.close(resolve);
        });
    }

}
