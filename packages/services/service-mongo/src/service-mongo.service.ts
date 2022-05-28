/* eslint-disable class-methods-use-this */
/**
 * ServiceMongo service for the MyApp cloud backend.
 * Uses the moleculer microservices framework.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

// Moleculer micro-services framework
import moleculer from 'moleculer';
import { Action, Event, Service, Method } from 'typed-moleculer';
import {
  serviceName,
  ExampleEvent,
  WelcomeParams,
  WelcomeResponse,
  AddTestEntityParams,
  AddTestEntityResponse,
  EditTestEntityParams,
  EditTestEntityResponse
} from '@my-app/service-mongo-api';

import CacheCleaner from './mixins/moleculer.cache.cleaner.mixin';
import { validateParams } from './lib/validate.data';
import * as ping from './action.handlers/ping';
import { welcome } from './action.handlers/welcome';
import { addTestEntity } from './action.handlers/add.test.entity';
import { editTestEntity } from './action.handlers/edit.test.entity';
import { eventWithPayload } from './event.handlers/event.with.payload';
import { broker, CTX } from './lib/moleculer/broker';

// Define our service-mongo service
@Service({
  name: serviceName,
  version: process.env.npm_package_version,
  settings: { $noVersionPrefix: true },
  mixins: [CacheCleaner([serviceName, 'all', 'authz', 'client'])] // events from these services, including ourselves, will cause us to clear our cache
})
export class ServiceMongoService extends moleculer.Service {
  // Our actions
  @Action()
  async ping(ctx: CTX): Promise<string> {
    return ping.ping(ctx);
  }

  @Action({ restricted: true })
  async pingAuth(ctx: CTX): Promise<string> {
    const res = ping.ping(ctx);
    // clean cache just exercise that code
    this.clearCache();
    return res;
  }

  @Action({ restricted: true })
  async welcome(ctx: CTX<WelcomeParams>): Promise<WelcomeResponse> {
    validateParams(ctx, WelcomeParams);
    return welcome(ctx);
  }

  @Action({ restricted: true, logCall: true })
  async addTestEntity(
    ctx: CTX<AddTestEntityParams>
  ): Promise<AddTestEntityResponse> {
    validateParams(ctx, AddTestEntityParams);
    const res = addTestEntity(ctx);
    this.clearCache();
    return res;
  }

  @Action({ restricted: true, logCall: true })
  async editTestEntity(
    ctx: CTX<EditTestEntityParams>
  ): Promise<EditTestEntityResponse> {
    validateParams(ctx, EditTestEntityParams);
    const res = editTestEntity(ctx);
    this.clearCache();
    return res;
  }

  // Incoming events
  @Event()
  eventWithoutPayload(/* _: any, sender: string, eventName: string */) {
    // call our event tester method so that we can write unite tests for this event
    this.eventTester();
  }

  @Event()
  async eventWithPayload(ctx: CTX<ExampleEvent>) {
    validateParams(ctx, ExampleEvent);
    eventWithPayload(ctx);
    // call our event tester method so that we can write unite tests for this event
    this.eventTester();
  }

  @Method
  eventTester(): void {} // eslint-disable-line class-methods-use-this

  @Method
  clearCache() {
    // tell everyone, including ourselves to clear caches
    broker.broadcast('cache.clean.service-mongo');
  }
}
