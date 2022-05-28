import { CTX } from '../lib/moleculer/broker';

export async function ping(ctx: CTX): Promise<string> {
  ctx.broker.logger.debug(`ping`, ctx);
  return 'Hello World!';
}
