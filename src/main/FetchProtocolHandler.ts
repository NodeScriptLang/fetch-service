import { FetchProtocol, fetchProtocol } from '@nodescript/fetch-protocol';
import { HttpProtocolHandler } from '@nodescript/http-server';
import { dep } from '@nodescript/mesh';

import { FetchProtocolImpl } from './FetchProtocolImpl.js';

export class FetchProtocolHandler extends HttpProtocolHandler<FetchProtocol> {
    protocol = fetchProtocol;

    @dep() protocolImpl!: FetchProtocolImpl;
}
