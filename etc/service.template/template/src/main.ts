/**
 * Copyright MyCompany 2022. All rights reserved.
 */
{{#if needDb}}
import 'reflect-metadata';
{{/if}}

import { broker } from './lib/moleculer/broker';
import { startAll } from './start.stop.all';
import { config } from './lib/env';

async function main() {
{{#if mongo}}
if (
  config.DB_CORE__CLIENT_URL === 'memory' &&
  (config.NODE_ENV === 'test' || config.NODE_ENV === 'development')
) {
    // if we are doing mongo, we need to spin up a mongo instance since otherwise we default to sqlite
    {{#if mongoTransactions}}
      const { MongoMemoryReplSet } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryReplSet.create({
        replSet: { storageEngine: 'wiredTiger' }
      });
      await mongod.waitUntilRunning();
    {{/if}}
    {{#unless mongoTransactions}}
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
    {{/unless}}

    config.DB_CORE__CLIENT_URL = mongod.getUri();
}
{{/if}}

  await startAll();

  if (config.NODE_ENV === 'development') {
    broker.repl();
  }

  if (process.env.NODE_ENV === 'test') {
    const repl = broker.repl();
    setTimeout(async () => {
      await repl.exec('quit');
    }, 500);
  }
}

main();
