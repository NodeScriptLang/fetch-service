import { FetchRequest, FetchResponse } from '@nodescript/fetch-protocol';

export abstract class FetchService {
    abstract sendRequest(request: FetchRequest): Promise<FetchResponse>;
}
