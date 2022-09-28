import dotenv from 'dotenv';

import { App } from '../main/app.js';

dotenv.config();

const app = new App();

try {
    await app.start();
} catch (error) {
    app.logger.error('Failed to start HTTP server', { error });
    process.exit(1);
}
