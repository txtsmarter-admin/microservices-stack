/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { MikroConnector } from 'moleculer-context-db';
{{#if mongo}}
import { MongoDriver } from '@mikro-orm/mongodb';
{{/if}}
import { EventEmitter } from 'events';

import { config } from './lib/env';
import { TableNamingStrategy } from './mikro.orm.naming.strategy';
import { entities } from './entities';

let dbConnector: MikroConnector{{#if mongo}}<MongoDriver>{{/if}} | null = null;
let initError: Error | null = null;

let pending: null | EventEmitter = null;
let closing = false;

export async function getDbConnector(): Promise<MikroConnector{{#if mongo}}<MongoDriver>{{/if}}> {
  if (closing) {
    throw new Error(`closeDbConnection() called but not yet completed`);
  }

  if (initError) {
    throw initError;
  }

  if (dbConnector) {
    return dbConnector;
  }

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    if (pending) {
      pending.once('resolve', resolve);
      pending.once('error', reject);
      return;
    }

    // 1-st call ever
    pending = new EventEmitter();
    pending.once('resolve', resolve);
    pending.once('error', reject);

    // try/catch because promise executor is async
    try {
      const tmpConnector = new MikroConnector{{#if mongo}}<MongoDriver>{{/if}}();

      await tmpConnector.init({
        type: config.DB_CORE__TYPE,
        dbName: config.DB_CORE__DB_NAME,
        name: config.DB_CORE__NAME,
        clientUrl: config.DB_CORE__CLIENT_URL,
        user: config.DB_CORE__USER,
        password: config.DB_CORE__PASSWORD,
        debug: config.DB_CORE__DEBUG,
        entities,
        cache: {
          enabled: false
        },
        namingStrategy: TableNamingStrategy,
        {{#if mongoTransactions}}
        implicitTransactions: true
        {{/if}}
      });
      
      dbConnector = tmpConnector;
    } catch (err: any) {
      initError = err;
      pending.emit('error', err);
      pending.removeAllListeners();
      pending = null;
      return;
    }

    pending.emit('resolve', dbConnector);
    pending.removeAllListeners();
    pending = null;
  });
}

export async function closeDbConnection(): Promise<void> {
  closing = true;

  if (dbConnector) {
    await dbConnector.getORM().close();
  }

  initError = null;
  dbConnector = null;
  closing = false;
}
