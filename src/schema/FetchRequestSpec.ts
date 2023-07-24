import { Schema } from 'airtight';

import { FetchHeaders, FetchHeadersSchema } from './FetchHeaders.js';
import { FetchMethod, FetchMethodSchema } from './FetchMethod.js';

export interface FetchRequestSpec {
    url: string;
    method: FetchMethod;
    headers: FetchHeaders;
    proxy?: string;
    followRedirects?: boolean;
    retries?: number;
}

export const FetchRequestSpecSchema = new Schema<FetchRequestSpec>({
    type: 'object',
    properties: {
        url: { type: 'string' },
        method: FetchMethodSchema.schema,
        headers: FetchHeadersSchema.schema,
        proxy: { type: 'string', optional: true },
        followRedirects: { type: 'boolean', optional: true },
        retries: { type: 'number', optional: true },
    },
});
