/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { config } from '../src/lib/env';

// Override default set in  package.json => jest.testTimeout
if (config.JEST_TIMEOUT !== undefined) {
  jest.setTimeout(+config.JEST_TIMEOUT);
}

// eslint-disable-next-line no-empty-function
async function globalSetup() {}

// eslint-disable-next-line no-empty-function
async function globalTearDown() {}

export { globalSetup, globalTearDown };
