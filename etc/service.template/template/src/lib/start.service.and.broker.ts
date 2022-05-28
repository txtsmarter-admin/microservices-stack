/**
 * Service broker and start/init function.
 * Use it everywhere (production, dev, tests).
 * Adapt using proper config (env vars).
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import Moleculer from 'moleculer';
import { EventEmitter } from 'events';
import { serviceName } from '@my-app/{{serviceName}}-api';

import { {{capitalizedCamelCaseServiceName}}Service as Service } from '../{{serviceName}}.service';
import { broker } from './moleculer/broker';


let service: Moleculer.Service | null = null;

let pending: null | EventEmitter = null;

export async function getService(): Promise<Moleculer.Service> {
  if (service) {
    return service;
  }

  return new Promise((resolve, reject) => {
    if (!pending) {
      reject(
        new Error(
          `await getService() should be called after startServiceAndBroker().`
        )
      );
    } else {
      pending.once('resolve', () => {
        /* istanbul ignore next */
        if (!service) {
          throw new Error(`Internal error - expected that service is set.`);
        }
        resolve(service);
      });

      pending.once('error', reject);
    }
  });
}

let started = false;

export async function startServiceAndBroker(
  middlewares: Array<string | Moleculer.Middleware | Moleculer.MiddlewareInit>
): Promise<void> {
  if (started) {
    throw new Error(`startServiceAndBroker() should be called only once.`);
  }
  started = true;

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    /* istanbul ignore next */
    if (!pending) {
      pending = new EventEmitter();
    }

    pending.on('resolve', resolve);
    pending.on('error', reject);

    try {
      middlewares.forEach(mw => broker.middlewares.add(mw));
      const tmpService = broker.createService(Service);
      await broker.start();
      await broker.waitForServices(serviceName);
      service = tmpService;
    } catch (err: any) {
      pending.emit('error', err);
      pending.removeAllListeners();
      pending = null;
      return;
    }

    pending.emit('resolve');
    pending.removeAllListeners();
    pending = null;
  });
}
