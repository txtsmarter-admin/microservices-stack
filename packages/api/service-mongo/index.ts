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
import {
  AddTestEntityParams,
  AddTestEntityResponse
} from './params/add.test.entity.params';
import {
  EditTestEntityParams,
  EditTestEntityResponse
} from './params/edit.test.entity.params';

export type ServiceActions =
  | ActionNoParams<'service-mongo.ping', string>
  | ActionNoParams<'service-mongo.pingAuth', string>
  | Action<'service-mongo.welcome', WelcomeParams, WelcomeResponse>
  | Action<
      'service-mongo.addTestEntity',
      AddTestEntityParams,
      AddTestEntityResponse
    >
  | Action<
      'service-mongo.editTestEntity',
      EditTestEntityParams,
      EditTestEntityResponse
    >;

export type ServiceName = 'service-mongo';
export const serviceName: ServiceName = 'service-mongo';

export type ServiceEvents = EventNoData<'cache.clean.service-mongo'>;

// CASL permissions
export type AppActions = 'manage' | 'welcome';
export type AppSubjects = 'all' | 'service-mongo';

export * from './params/add.test.entity.params';
export * from './params/edit.test.entity.params';
export * from './params/welcome.params';
export * from './events/example.event';
