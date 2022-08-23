/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { getLogMiddleware } from './middlewares/moleculer.log.middleware';
{{#if needDb}}
import { getDbMiddleware } from './middlewares/moleculer.db.middleware';
import { closeDbConnection } from './db.connector';
{{/if}}
import {
  authenticateMoleculerContext,
  getAuthMiddleware
} from './middlewares/moleculer.auth.middleware';
import { getSagaMiddleware } from './middlewares/moleculer.saga.middleware';
import {
  startServiceAndBroker,
  getService
} from './lib/start.service.and.broker';
import { broker } from './lib/moleculer/broker';

let started = false;

export async function startAll() {
  if (started) {
    throw new Error(
      `startAll() called 2 times in a row. Expected stopAll() before next startAll() call.`
    );
  }
  started = true;

  const authMiddleware = getAuthMiddleware(authenticateMoleculerContext);

  const logInfo = broker.logger.info.bind(broker.logger);
  const logMiddleware = getLogMiddleware(logInfo);

  const sagaMiddleware = getSagaMiddleware()

  const middlewares = [authMiddleware, logMiddleware, sagaMiddleware];

  {{#if needDb}}
  const dbMiddleware = await getDbMiddleware();
  middlewares.push(dbMiddleware);
  {{/if}}

  await startServiceAndBroker(middlewares);
}

export async function stopAll(): Promise<void> {
  if (!started) {
    throw new Error(`stopAll() should not be called before startAll().`);
  }

  const service = await getService();

  await broker.destroyService(service);
  await broker.stop();
  {{#if needDb}}
  await closeDbConnection();
  {{/if}}
  
  started = false;
}
