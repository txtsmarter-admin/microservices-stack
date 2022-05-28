/**
 * Copyright MyCompany 2022. All rights reserved.
 */

afterEach(() => {
  jest.resetModules();
});

test('Get multiple one by one', async () => {
  const { globalSetup, globalTearDown } = await import('../setup');
  await globalSetup();

  const { getDbMiddleware } = await import(
    '../../src/middlewares/moleculer.db.middleware'
  );
  const { closeDbConnection } = await import('../../src/db.connector');

  const mw1 = await getDbMiddleware();
  const mw2 = await getDbMiddleware();
  expect(mw1).toBe(mw2);

  // cleanup
  await closeDbConnection();
  await globalTearDown();
});

test('Get multiple at once', async () => {
  const { globalSetup, globalTearDown } = await import('../setup');
  await globalSetup();

  const { getDbMiddleware } = await import(
    '../../src/middlewares/moleculer.db.middleware'
  );
  const { closeDbConnection } = await import('../../src/db.connector');

  const [mw1, mw2] = await Promise.all([getDbMiddleware(), getDbMiddleware()]);
  expect(mw1).toBe(mw2);

  // cleanup
  await closeDbConnection();
  await globalTearDown();
});

test('Get if db connector fails.', async () => {
  const { globalSetup, globalTearDown } = await import('../setup');
  await globalSetup();

  const { getDbMiddleware } = await import(
    '../../src/middlewares/moleculer.db.middleware'
  );
  const dbcModule = await import('../../src/db.connector');

  jest
    .spyOn(dbcModule, 'getDbConnector')
    .mockRejectedValue(new Error('Test error'));

  await expect(getDbMiddleware()).rejects.toThrow();

  // cleanup
  await dbcModule.closeDbConnection();
  await globalTearDown();
});

export {};
