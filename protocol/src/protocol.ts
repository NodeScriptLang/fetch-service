import { ProtocolIndex } from '@flexent/protocomm';

import { FetchDomain } from './domains/Fetch.js';

export interface FetchProtocol {
    Fetch: FetchDomain;
}

export const fetchProtocol = new ProtocolIndex<FetchProtocol>({
    Fetch: FetchDomain,
});
