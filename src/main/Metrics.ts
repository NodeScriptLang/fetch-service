import { CounterMetric, HistogramMetric, metric } from '@nodescript/metrics';

export class Metrics {

    @metric()
    requestLatency = new HistogramMetric<{
        status: number;
        method: string;
        hostname: string;
        error?: string;
    }>('nodescript_fetch_service_request_latency', 'NodeScript Fetch Service request latency');

    @metric()
    errors = new CounterMetric<{
        error: string;
        code: string;
    }>('nodescript_fetch_service_errors_total', 'NodeScript Fetch Service errors');

}
