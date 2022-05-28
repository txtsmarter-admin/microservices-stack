import { Context, Service, ServiceSchema } from 'moleculer';

const mixin = (serviceNames: string[]): Partial<ServiceSchema> => {
  const events: Record<string, any> = {};

  serviceNames.forEach(name => {
    events[`cache.clean.${name}`] = async function clean(ctx: Context) {
      const service = ctx.service as Service;
      if (service.broker.cacher) {
        await service.broker.cacher.clean();
        await service.postCacheCleanHook();
      }
    };
  });

  return {
    events,
    methods: {
      postCacheCleanHook() {}
    }
  };
};

export default mixin;
