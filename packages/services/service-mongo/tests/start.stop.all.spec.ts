/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { globalSetup, globalTearDown } from './setup';
import { startAll, stopAll } from '../src/start.stop.all';

describe('Service start/stop tests', () => {
  beforeAll(async () => {
    await globalSetup(); // should be first!
  });

  afterAll(async () => {
    await globalTearDown(); // should be last!
  });

  test('stopAll() before startAll()', async () => {
    await expect(stopAll()).rejects.toThrow();
    await startAll();
    await expect(startAll()).rejects.toThrow();
    await stopAll();
  });
});
