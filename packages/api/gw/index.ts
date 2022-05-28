/**
 * External api for other services
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import {
  GenericActionWithParameters as Action,
  GenericActionWithoutParameters as ActionNoParams,
  GenericEventWithoutPayload as EventNoData
} from 'typed-moleculer';
import { WelcomeParams, WelcomeResponse } from './params/welcome.params';

export type ServiceActions =
  | ActionNoParams<'gw.ping', string>
  | ActionNoParams<'gw.pingAuth', string>
  | Action<'gw.welcome', WelcomeParams, WelcomeResponse>;

export type ServiceName = 'gw';
export const serviceName: ServiceName = 'gw';

export type ServiceEvents = EventNoData<'cache.clean.gw'>;

// CASL permissions
export type AppActions = 'manage' | 'welcome';
export type AppSubjects = 'all' | 'gw';

export * from './params/welcome.params';
export * from './events/example.event';
