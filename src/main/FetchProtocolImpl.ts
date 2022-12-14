import { FetchProtocol } from '@nodescript/fetch-protocol';
import { dep } from 'mesh-ioc';

import { FetchDomainImpl } from './FetchDomainImpl.js';

export class FetchProtocolImpl implements FetchProtocol {
    @dep() Fetch!: FetchDomainImpl;
}
