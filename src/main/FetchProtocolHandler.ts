import { FetchProtocol, fetchProtocol } from '@nodescript/adapter-fetch-protocol';
import { HttpProtocolHandler } from '@nodescript/http-server';
import { dep } from 'mesh-ioc';

import { FetchProtocolImpl } from './FetchProtocolImpl.js';

export class FetchProtocolHandler extends HttpProtocolHandler<FetchProtocol> {
    protocol = fetchProtocol;

    @dep() protocolImpl!: FetchProtocolImpl;
}
