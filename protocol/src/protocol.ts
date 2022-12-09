import { ProtocolIndex } from '@nodescript/protocomm';

import { FetchDomain } from './domains/FetchDomain.js';

export interface FetchProtocol {
    Fetch: FetchDomain;
}

export const fetchProtocol = new ProtocolIndex<FetchProtocol>({
    Fetch: FetchDomain,
});
