/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { getDbConnector } from '../src/db.connector';

export async function resetServiceDB(): Promise<void> {
  const dbConnector = await getDbConnector();

  {{#if sql}}
  await dbConnector
    .getORM()
    .getSchemaGenerator()
    .dropSchema();
  await dbConnector
    .getORM()
    .getSchemaGenerator()
    .createSchema();
{{/if}}
{{#if mongo}}
  await dbConnector.getORM().em.getDriver().dropCollections();
  await dbConnector.getORM().em.getDriver().createCollections();
{{/if}}
}
