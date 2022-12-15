import { Schema } from 'airtight';

export enum FetchMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

export const FetchMethodSchema = new Schema<FetchMethod>({
    id: 'FetchMethod',
    type: 'string',
    enum: Object.values(FetchMethod),
});
