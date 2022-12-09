import { FetchDomain, FetchRequest, FetchResponse } from '@nodescript/fetch-protocol';
import { dep } from '@nodescript/mesh';

import { FetchService } from './FetchService.js';

export class FetchDomainImpl implements FetchDomain {
    @dep() protected fetchService!: FetchService;

    async sendRequest(req: {
        request: FetchRequest;
    }): Promise<{
        response: FetchResponse;
    }> {
        const response = await this.fetchService.sendRequest(req.request);
        return { response };
    }

}
