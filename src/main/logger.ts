import { config } from '@flexent/config';
import { LogfmtLogger } from '@flexent/logger';

export class StandardLogger extends LogfmtLogger {

    @config({ default: 'info' }) LOG_LEVEL!: string;
    @config({ default: false }) LOG_PRETTY!: boolean;

    constructor() {
        super();
        this.setLevel(this.LOG_LEVEL);
        this.setPretty(this.LOG_PRETTY);
    }

}
