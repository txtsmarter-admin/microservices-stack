import { BrokerOptions, ServiceBroker, ServiceSchema } from 'moleculer';

import CacheCleaner from '../../src/mixins/moleculer.cache.cleaner.mixin';

describe('cache cleaner mixin test', () => {
  const serviceSchema: ServiceSchema = {
    name: 'service',

    mixins: [CacheCleaner(['service'])]
  };

  test('broker without cacher', async () => {
    const brokerOptions: BrokerOptions = {
      logLevel: 'fatal'
    };

    const broker = new ServiceBroker(brokerOptions);

    const service = broker.createService(serviceSchema);
    await broker.start();
    await broker.waitForServices(serviceSchema.name);

    const spy = jest.spyOn(service, 'postCacheCleanHook');

    broker.broadcast(`cache.clean.${serviceSchema.name}`);

    await broker.destroyService(service);
    await broker.stop();

    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('broker with cacher', async () => {
    const brokerOptions: BrokerOptions = {
      logLevel: 'fatal',
      cacher: 'Memory'
    };

    const broker = new ServiceBroker(brokerOptions);

    const service = broker.createService(serviceSchema);
    await broker.start();
    await broker.waitForServices(serviceSchema.name);

    const spy = jest.spyOn(service, 'postCacheCleanHook');

    broker.broadcast(`cache.clean.${serviceSchema.name}`);

    await broker.destroyService(service);
    await broker.stop();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
