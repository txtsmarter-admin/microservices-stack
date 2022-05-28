/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { getDbConnector } from '../src/db.connector';

export async function resetServiceDB(): Promise<void> {
  const dbConnector = await getDbConnector();

  await dbConnector.getORM().getSchemaGenerator().dropSchema();
  await dbConnector.getORM().getSchemaGenerator().createSchema();
}
