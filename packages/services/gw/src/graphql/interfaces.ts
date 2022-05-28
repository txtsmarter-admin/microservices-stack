/**
 * Typed interface for graphql resolver context.
 *

 */

import { TypedServiceBroker } from 'typed-moleculer';
import { ResponseToolkit, Request } from '@hapi/hapi';
import { ContextMeta, Auth } from '@my-app/authz-api';

// Import our service names, actions, and events
import { ServiceActions, ServiceEvents, ServiceName } from '../service.types'; // eslint-disable-line import/extensions

export type ResolverContext = {
  moleculerBroker: TypedServiceBroker<
    ServiceActions,
    ServiceEvents,
    ServiceName,
    ContextMeta
  >;
  myAppIdToken?: string;
  bearerToken?: string;
  auth: Auth;
  request: Request;
  response: ResponseToolkit;
};

export type ResolverContextNoAuth = Omit<ResolverContext, 'auth'>;
