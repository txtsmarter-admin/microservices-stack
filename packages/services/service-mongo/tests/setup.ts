/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import 'reflect-metadata';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { config } from '../src/lib/env';

let mongod: MongoMemoryReplSet;

// Override default set in  package.json => jest.testTimeout
if (config.JEST_TIMEOUT !== undefined) {
  jest.setTimeout(+config.JEST_TIMEOUT);
}

async function globalSetup() {
  // create an in-memory mongodb instance
  mongod = await MongoMemoryReplSet.create({
    replSet: { storageEngine: 'wiredTiger' }
  });
  await mongod.waitUntilRunning();

  config.DB_CORE__CLIENT_URL = mongod.getUri();
}

async function globalTearDown() {
  await mongod.stop();
}

export { globalSetup, globalTearDown };
