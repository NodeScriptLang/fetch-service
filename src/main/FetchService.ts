import { FetchRequest, FetchResponse } from '@nodescript/adapter-fetch-protocol';

export abstract class FetchService {
    abstract sendRequest(request: FetchRequest): Promise<FetchResponse>;
}
