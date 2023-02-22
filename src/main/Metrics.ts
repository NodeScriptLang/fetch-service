import { HistogramMetric, metric } from '@nodescript/metrics';

export class Metrics {
    @metric()
    serviceRequestLatency = new HistogramMetric<{
        domain: string;
        status: string;
        method: string;
        error?: string;
    }>('nodescript_fetch_service_request_latency', 'NodeScript Fetch Service requests latency');

}
