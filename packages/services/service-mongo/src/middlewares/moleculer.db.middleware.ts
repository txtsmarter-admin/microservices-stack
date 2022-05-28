/**
 * Important:
 *  - do not rename this file
 *  - do not modify interface of this file
 *
 * This file is used by src/lib and it's purpose is to provide initialized mikro-orm database connector
 *
 * Copyright MyCompany 2019. All rights reserved.
 */

import { Middleware } from 'moleculer';
import { DatabaseContextManager } from 'moleculer-context-db';
import thunkyp from 'thunky/promise';

import * as dbConnectorModule from '../db.connector';

export const getDbMiddleware = thunkyp(async (): Promise<Middleware> => {
  const dbConnector = await dbConnectorModule.getDbConnector();

  const dbContextManager: DatabaseContextManager = new DatabaseContextManager(
    dbConnector
  );

  const dbMiddleware = dbContextManager.middleware();

  return dbMiddleware;
});
