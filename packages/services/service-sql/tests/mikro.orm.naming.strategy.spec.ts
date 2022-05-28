/**
 * Entry point for Mikro-ORM naming strategy unit tests.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

import { TableNamingStrategy } from '../src/mikro.orm.naming.strategy';

describe('Test table naming strategy', () => {
  test('main classToTable namespace test', () => {
    const entityName = 'service-sql';

    const tableName = new TableNamingStrategy().classToTableName(entityName);

    expect(tableName).toBe(entityName);
  });

  test('secondary classToTable namespace test', () => {
    const entityName = 'foo';

    const tableName = new TableNamingStrategy().classToTableName(entityName);
    expect(tableName).toBe(`service-sql_${entityName}`);
  });
});
