import { Schema } from 'airtight';

import { FetchHeaders, FetchHeadersSchema } from './FetchHeaders.js';
import { FetchMethod, FetchMethodSchema } from './FetchMethod.js';

export interface FetchRequest {
    url: string;
    method: FetchMethod;
    headers: FetchHeaders;
    bodyBase64?: string;
    proxy?: string;
    followRedirects?: boolean;
    retries?: number;
}

export const FetchRequestSchema = new Schema<FetchRequest>({
    id: 'FetchRequest',
    type: 'object',
    properties: {
        url: { type: 'string' },
        method: FetchMethodSchema.schema,
        headers: FetchHeadersSchema.schema,
        bodyBase64: { type: 'string', optional: true },
        proxy: { type: 'string', optional: true },
        followRedirects: { type: 'boolean', optional: true },
        retries: { type: 'number', optional: true },
    }
});
