/* eslint-disable class-methods-use-this */
/**
 * Gw service for the MyApp cloud backend.
 * Uses the moleculer microservices framework.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

// Moleculer micro-services framework
import moleculer from 'moleculer';
import { Action, Event, Service, Method } from 'typed-moleculer';
import {
  ApolloServer,
  ApolloServerPluginStopHapiServer
} from 'apollo-server-hapi';
import Hapi, { ResponseToolkit, Request } from '@hapi/hapi';
import {
  serviceName,
  ExampleEvent,
  WelcomeParams,
  WelcomeResponse
} from '@my-app/gw-api';
import ms from 'ms';

import CacheCleaner from './mixins/moleculer.cache.cleaner.mixin';
import { validateParams } from './lib/validate.data';
import * as ping from './action.handlers/ping';
import { welcome } from './action.handlers/welcome';
import { eventWithPayload } from './event.handlers/event.with.payload';
import { broker, CTX } from './lib/moleculer/broker';
import schema from './graphql';

import { config } from './lib/env';
import { MYAPP_ID_TOKEN_COOKIE } from './graphql/auth/auth.utils';
import { ResolverContextNoAuth } from './graphql/interfaces';
import {
  ApolloServerPluginCacheControlDisabled,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core';

const AUTH__EXPIRES_IN__MS: number = ms(config.AUTH__EXPIRES_IN);
/* istanbul ignore next */
const PRODUCTION: boolean =
  process.env.NODE_ENV === 'production' ? true : false;

// Define our gw service
@Service({
  name: serviceName,
  version: process.env.npm_package_version,
  settings: { $noVersionPrefix: true },
  mixins: [CacheCleaner([serviceName, 'all', 'authz'])] // events from these services, including ourselves, will cause us to clear our cache
})
export class GwService extends moleculer.Service {
  server!: Hapi.Server;

  // Startup handler
  async started() {
    const moleculerBroker = this.broker;
    const hapiServer = Hapi.server({
      port: config.GRAPHQL__SERVER_PORT,
      routes: {
        cors: {
          origin: ['*'],
          credentials: false
        }
      }
    });

    // Create our Apollo GraphQL server here
    const gqlServer = new ApolloServer({
      schema,
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      context: async ({
        request,
        h
      }: {
        request: Request;
        h: ResponseToolkit;
      }) => {
        const myAppIdToken = request.state[MYAPP_ID_TOKEN_COOKIE]; // for user login
        // for 3rd party system authentication
        const bearerToken = request.headers.authorization?.replace(
          'Bearer ',
          ''
        );

        const resolverContext: ResolverContextNoAuth = {
          moleculerBroker,
          myAppIdToken,
          bearerToken,
          request,
          response: h
        };

        return resolverContext;
      },
      csrfPrevention: true,
      plugins: [
        ApolloServerPluginStopHapiServer({ hapiServer }),
        /* istanbul ignore next */
        PRODUCTION
          ? ApolloServerPluginLandingPageDisabled()
          : config.GRAPHQL__PLAYGROUND
          ? ApolloServerPluginLandingPageGraphQLPlayground()
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
        ApolloServerPluginCacheControlDisabled()
      ]
    });

    // Declare cookie
    hapiServer.state(MYAPP_ID_TOKEN_COOKIE, {
      isHttpOnly: true,
      ttl: AUTH__EXPIRES_IN__MS,
      isSecure: false
    });

    await gqlServer.start();
    await gqlServer.applyMiddleware({
      app: hapiServer as any,
      path: '/graphql'
    }); // default path is /graphql

    await hapiServer
      .start()
      .then(() => {
        this.broker.logger.info(
          `🚀  Apollo Server ready at port "${hapiServer.settings.port}", path "${gqlServer.graphqlPath}", 🚀  ${hapiServer.info.uri}`
        );
      })
      .catch(
        /* istanbul ignore next */ err => {
          this.broker.logger.error(
            `🚀  Apollo Server start error: ${err.message}`
          );
        }
      );

    this.server = hapiServer;
  }

  // Stopped handler
  stopped() {
    this.server.stop();
  }

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
    broker.broadcast('cache.clean.gw');
  }
}
