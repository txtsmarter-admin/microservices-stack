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
  | ActionNoParams<'service-sql.ping', string>
  | ActionNoParams<'service-sql.pingAuth', string>
  | Action<'service-sql.welcome', WelcomeParams, WelcomeResponse>
  | Action<
      'service-sql.addTestEntity',
      AddTestEntityParams,
      AddTestEntityResponse
    >
  | Action<
      'service-sql.editTestEntity',
      EditTestEntityParams,
      EditTestEntityResponse
    >;

export type ServiceName = 'service-sql';
export const serviceName: ServiceName = 'service-sql';

export type ServiceEvents = EventNoData<'cache.clean.service-sql'>;

// CASL permissions
export type AppActions = 'manage' | 'welcome';
export type AppSubjects = 'all' | 'service-sql';

export * from './params/add.test.entity.params';
export * from './params/edit.test.entity.params';
export * from './params/welcome.params';
export * from './events/example.event';
