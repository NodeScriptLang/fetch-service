import { Schema } from 'airtight';

export interface FetchHeaders {
    [key: string]: string | string[];
}

export const FetchHeadersSchema = new Schema<FetchHeaders>({
    id: 'FetchHeaders',
    type: 'object',
    properties: {},
    additionalProperties: { type: 'any' },
});
