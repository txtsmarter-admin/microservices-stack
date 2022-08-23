/**
 * Copyright MyCompany 2022. All rights reserved.
 */

import { broker } from './lib/moleculer/broker';
import { startAll } from './start.stop.all';
import { config } from './lib/env';

async function main() {
  await startAll();

  if (config.NODE_ENV === 'development') {
    broker.repl();
  }

  if (process.env.NODE_ENV === 'test') {
    const repl = broker.repl();
    setTimeout(async () => {
      await repl.eval('quit');
    }, 500);
  }
}

main();
