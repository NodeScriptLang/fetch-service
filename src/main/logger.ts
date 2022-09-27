import { config } from '@flexent/config';
import { LogfmtLogger } from '@flexent/logger';

export class StandardLogger extends LogfmtLogger {

    @config() LOG_LEVEL!: string;

    constructor() {
        super();
        this.setLevel(this.LOG_LEVEL);
    }

}
