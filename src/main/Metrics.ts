import { HistogramMetric, metric } from '@nodescript/metrics';

export class Metrics {

    @metric()
    serviceRequestLatency = new HistogramMetric<{
        service: string;
        status: number;
        method: string;
    }>('nodescript_fetch_service_request_latency', 'NodeScript Fetch Service requests latency');

}
