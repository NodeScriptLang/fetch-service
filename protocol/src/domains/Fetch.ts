import { DomainDef } from '@flexent/protocomm';

import { FetchRequest, FetchRequestSchema } from '../schema/FetchRequest.js';
import { FetchResponse, FetchResponseSchema } from '../schema/FetchResponse.js';

export interface FetchDomain {

    sendRequest(req: {
        request: FetchRequest;
    }): Promise<{
        response: FetchResponse;
    }>;

}

export const FetchDomain: DomainDef<FetchDomain> = {
    name: 'Fetch',
    methods: {
        sendRequest: {
            type: 'command',
            params: {
                request: { ...FetchRequestSchema.schema }
            },
            returns: {
                response: { ...FetchResponseSchema.schema },
            },
        },
    },
    events: {},
};
