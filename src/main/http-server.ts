import { BaseHttpServer, HttpProtocolHandler } from '@flexent/http-server';
import { dep } from '@flexent/mesh';
import { FetchProtocol, fetchProtocol } from '@nodescript/fetch-protocol';

import { FetchDomainImpl } from './domains/fetch.js';

export class HttpServer extends BaseHttpServer {

    constructor() {
        super();
        this.addRequestHandler(FetchProtocolHandler);
    }

}

export class FetchProtocolImpl implements FetchProtocol {
    @dep() Fetch!: FetchDomainImpl;
}

export class FetchProtocolHandler extends HttpProtocolHandler<FetchProtocol> {
    protocol = fetchProtocol;

    @dep() protocolImpl!: FetchProtocolImpl;
}
