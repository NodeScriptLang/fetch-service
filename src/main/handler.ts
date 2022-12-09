import { FetchProtocol, fetchProtocol } from '@nodescript/fetch-protocol';
import { HttpProtocolHandler } from '@nodescript/http-server';
import { dep } from '@nodescript/mesh';

import { FetchDomainImpl } from './domains/fetch.js';

export class FetchProtocolImpl implements FetchProtocol {
    @dep() Fetch!: FetchDomainImpl;
}

export class FetchProtocolHandler extends HttpProtocolHandler<FetchProtocol> {
    protocol = fetchProtocol;

    @dep() protocolImpl!: FetchProtocolImpl;
}
