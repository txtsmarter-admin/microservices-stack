/**
 * Important:
 * - Do not rename file.
 * - Do not rename exported types.
 * - File used by ./lib/moleculer/broker.ts
 *
 * Should contain api of current service and others.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import {
  ServiceName,
  ServiceActions as GwActions,
  ServiceEvents as GwEvents
} from '@my-app/gw-api';
import { ServiceActions as AuthActions } from '@my-app/authz-api';

export type { ServiceName };

// Add other services types here, eg;
// export type ServiceActions = DiscountActions | UserActions | IotActions;
export type ServiceActions = GwActions | AuthActions;

// These are the events ONLY we emit (not related to what we listen for)
export type ServiceEvents = GwEvents;
