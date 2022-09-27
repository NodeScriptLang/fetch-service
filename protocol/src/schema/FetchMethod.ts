import { Schema } from '@flexent/schema';

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
