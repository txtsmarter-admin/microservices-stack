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
{{#if needDb}}
import { AddTestEntityParams, AddTestEntityResponse } from './params/add.test.entity.params';
import { EditTestEntityParams, EditTestEntityResponse } from './params/edit.test.entity.params';
{{/if}}

export type ServiceActions =
  | ActionNoParams<'{{serviceName}}.ping', string>
  | ActionNoParams<'{{serviceName}}.pingAuth', string>
  | Action<'{{serviceName}}.welcome', WelcomeParams, WelcomeResponse>
{{#if needDb}}
  | Action<'{{serviceName}}.addTestEntity', AddTestEntityParams, AddTestEntityResponse>
  | Action<'{{serviceName}}.editTestEntity', EditTestEntityParams, EditTestEntityResponse>
{{/if}}
;

export type ServiceName = '{{serviceName}}';
export const serviceName: ServiceName = '{{serviceName}}';

export type ServiceEvents = EventNoData<'cache.clean.{{serviceName}}'>;

// CASL permissions
export type AppActions = 'manage' | 'welcome';
export type AppSubjects = 'all' | '{{serviceName}}';

{{#if needDb}}
export * from './params/add.test.entity.params';
export * from './params/edit.test.entity.params';
{{/if}}
export * from './params/welcome.params';
export * from './events/example.event';
