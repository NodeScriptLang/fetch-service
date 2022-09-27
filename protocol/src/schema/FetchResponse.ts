import { Schema } from 'airtight';

import { FetchHeaders, FetchHeadersSchema } from './FetchHeaders.js';

export interface FetchResponse {
    status: number;
    url: string;
    headers: FetchHeaders;
    bodyBase64: string;
}

export const FetchResponseSchema = new Schema<FetchResponse>({
    id: 'FetchResponse',
    type: 'object',
    properties: {
        status: { type: 'number' },
        headers: FetchHeadersSchema.schema,
        url: { type: 'string' },
        bodyBase64: { type: 'string' },
    }
});
