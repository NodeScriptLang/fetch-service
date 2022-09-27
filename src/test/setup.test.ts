import { runtime } from './runtime.js';

beforeEach(async () => {
    await runtime.setup();
});

afterEach(async () => {
    await runtime.teardown();
});
