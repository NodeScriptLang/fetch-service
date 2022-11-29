import { config } from '@nodescript/config';
import { ConsoleLogger, LogfmtLogger, Logger, LogLevel } from '@nodescript/logger';

export class StandardLogger extends Logger {

    @config({ default: 'info' }) LOG_LEVEL!: string;
    @config({ default: false }) LOG_PRETTY!: boolean;

    private delegate: Logger;

    constructor() {
        super();
        this.delegate = this.LOG_PRETTY ? new ConsoleLogger() : new LogfmtLogger();
        this.setLevel(this.LOG_LEVEL);
    }

    override write(level: LogLevel, message: string, data: object): void {
        this.delegate.write(level, message, data);
    }

}
