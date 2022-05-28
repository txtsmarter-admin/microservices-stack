/**
 * Copyright MyCompany 2022. All rights reserved.
 */
beforeEach(() => {
  jest.resetModules();
});

test('getService() before startServiceAndBroker() => FAIL', async () => {
  const { getService } = await import('../../src/lib/start.service.and.broker');
  await expect(getService()).rejects.toThrow();
});

test('startServiceAndBroker() and getService() should throw when broker is unable to create service', async () => {
  const { getService, startServiceAndBroker } = await import(
    '../../src/lib/start.service.and.broker'
  );
  const { broker } = await import('../../src/lib/moleculer/broker');

  // Need this to increase coverage
  jest
    .spyOn(broker, 'start')
    .mockImplementation(async () => Promise.reject(new Error('Test Error')));

  startServiceAndBroker([])
    .then(() => {
      // eslint-disable-next-line no-undef
      fail('startServiceAndBroker() should fail if broker unable to start');
    })
    .catch(() => {
      /* as expected */
    });
  await expect(getService()).rejects.toThrow();
});

test('Call getService() before startServiceAndBroker() completed.', async () => {
  const { getService, startServiceAndBroker } = await import(
    '../../src/lib/start.service.and.broker'
  );
  const { broker } = await import('../../src/lib/moleculer/broker');

  const [, service] = await Promise.all([
    startServiceAndBroker([]),
    getService()
  ]);

  await broker.destroyService(service);
  await broker.stop();
});

test('Call startServiceAndBroker() when already started => FAIL', async () => {
  const { startServiceAndBroker, getService } = await import(
    '../../src/lib/start.service.and.broker'
  );
  const { broker } = await import('../../src/lib/moleculer/broker');

  const [, service] = await Promise.all([
    startServiceAndBroker([]),
    getService()
  ]);

  await expect(startServiceAndBroker([])).rejects.toThrow();

  // Clean up
  await broker.destroyService(service);
  await broker.stop();
});

export {};
