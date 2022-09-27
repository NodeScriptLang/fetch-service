import { FetchMethod } from '@nodescript/fetch-protocol';
import assert from 'assert';

import { runtime } from './runtime.js';

describe('Fetch.sendRequest', () => {

    it('sends GET request', async () => {
        runtime.testHttpServer.requestHandler = (req, res) => {
            assert.strictEqual(req.url, '/foo');
            assert.strictEqual(req.headers['host'], '127.0.0.1:8099');
            assert.strictEqual(req.headers['content-type'], 'text/plain');
            assert.strictEqual(req.headers['cookie'], 'foo=1; bar=2');
            assert.strictEqual(req.headers['x-foo'], 'Bar, Baz');
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'X-Response-Time': 42,
                'Cache-Control': ['private', 'no-cache'],
            });
            res.end('Hello!');
        };
        const { response } = await runtime.Fetch.sendRequest({
            request: {
                url: 'http://127.0.0.1:8099/foo',
                method: FetchMethod.GET,
                headers: {
                    'Content-Type': ['text/plain'],
                    'Cookie': ['foo=1; bar=2'],
                    'X-Foo': ['Bar', 'Baz'],
                },
            }
        });
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.headers['content-type'][0], 'text/plain');
        assert.strictEqual(response.headers['x-response-time'][0], '42');
        assert.strictEqual(response.headers['cache-control'][0], 'private');
        assert.strictEqual(response.headers['cache-control'][1], 'no-cache');
        const body = Buffer.from(response.bodyBase64, 'base64').toString('utf-8');
        assert.strictEqual(body, 'Hello!');
    });

    it('sends POST with body', async () => {
        runtime.testHttpServer.requestHandler = async (req, res) => {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            const body = Buffer.concat(chunks).toString();
            assert.strictEqual(body, 'Hello World!');
            res.writeHead(200, {});
            res.end();
        };
        const { response } = await runtime.Fetch.sendRequest({
            request: {
                url: 'http://127.0.0.1:8099/foo',
                method: FetchMethod.POST,
                headers: {},
                bodyBase64: Buffer.from('Hello World!').toString('base64'),
            }
        });
        assert.strictEqual(response.status, 200);
    });

    describe('redirects', () => {

        beforeEach(() => {
            runtime.testHttpServer.requestHandler = async (req, res) => {
                if (req.url === '/redirect') {
                    res.writeHead(302, {
                        location: '/bar/baz',
                    });
                    res.end();
                } else {
                    res.writeHead(200, {});
                    res.end('Hello!');
                }
            };
        });

        it('follows redirect by default', async () => {
            const { response } = await runtime.Fetch.sendRequest({
                request: {
                    url: 'http://127.0.0.1:8099/redirect',
                    method: FetchMethod.GET,
                    headers: {},
                }
            });
            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.url, 'http://127.0.0.1:8099/bar/baz');
            const body = Buffer.from(response.bodyBase64, 'base64').toString('utf-8');
            assert.strictEqual(body, 'Hello!');
        });

        it('does not follow redirect if followRedirect: false', async () => {
            const { response } = await runtime.Fetch.sendRequest({
                request: {
                    url: 'http://127.0.0.1:8099/redirect',
                    method: FetchMethod.GET,
                    headers: {},
                    followRedirects: false,
                }
            });
            assert.strictEqual(response.status, 302);
            assert.strictEqual(response.url, 'http://127.0.0.1:8099/redirect');
            const body = Buffer.from(response.bodyBase64, 'base64').toString('utf-8');
            assert.strictEqual(body, '');
        });

    });

});
