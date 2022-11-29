import { Schema } from '@nodescript/schema';

export interface FetchHeaders {
    [key: string]: string[];
}

export const FetchHeadersSchema = new Schema<FetchHeaders>({
    id: 'FetchHeaders',
    type: 'object',
    properties: {},
    additionalProperties: {
        type: 'array',
        items: { type: 'string' },
    },
});
