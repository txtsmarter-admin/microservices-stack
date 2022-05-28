/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { AbilityBuilder, PureAbility } from '@casl/ability';
import moment from 'moment';
import { Auth } from '@my-app/authz-api';
import * as AuthzApi from '@my-app/authz-api';
import { WelcomeParams, WelcomeResponse } from '@my-app/gw-api';

import { config } from '../src/lib/env';
import { broker } from '../src/lib/moleculer/broker';

export function createAuth(
  abilitiesFn: (abilityBuilder: AbilityBuilder<any>) => void,
  opts?: { userId?: string; clientId?: string; roles?: string[] }
): Auth {
  const abilityBuilder = new AbilityBuilder<any>(PureAbility);

  abilitiesFn(abilityBuilder);

  return {
    userId: opts?.userId || 'default-user-id',
    permissions: {
      rules: abilityBuilder.rules as any
    }
  };
}

export type TimeUnit = moment.unitOfTime.Base;

function resolveArgsOfFutureAndPastFunctions(...args: any[]) {
  let from: Date;
  let amount: number;
  let unit: TimeUnit;

  if (args.length === 2) {
    from = new Date();
    // eslint-disable-next-line prefer-destructuring
    amount = args[0];
    // eslint-disable-next-line prefer-destructuring
    unit = args[1];
  } else {
    // eslint-disable-next-line prefer-destructuring
    from = args[0];
    // eslint-disable-next-line prefer-destructuring
    amount = args[1];
    // eslint-disable-next-line prefer-destructuring
    unit = args[2];
  }

  return { from, amount, unit };
}

export function now(): Date {
  return new Date();
}

export function future(amount: number, unit: TimeUnit): Date;
// eslint-disable-next-line no-redeclare
export function future(from: Date, amount: number, unit: TimeUnit): Date;
// eslint-disable-next-line no-redeclare
export function future(...args: any[]): Date {
  const { from, amount, unit } = resolveArgsOfFutureAndPastFunctions(...args);

  return moment(from.getTime()).add(amount, unit).toDate();
}

// --------------------------------------------------------------
//  broker.call mocking
//

let actionsMocks = {};
let recentBrokerCallSpy: jest.SpyInstance | null = null;

export function clearBrokerCallMocks() {
  actionsMocks = {};
}

afterEach(() => {
  clearBrokerCallMocks();
});

/**
 * Multiple calls cause add new and update existing mocks.
 * It's NOT removing any existing mocks.
 *
 * To remove all broker.call mocks use clearBrokerCallMocks().
 *
 * Mocks will be cleared automatically after each test.
 */
export function mockBrokerCall(mocks: {
  'gw.welcome'?: (args: { params: WelcomeParams }) => Promise<WelcomeResponse>;
  'gw.pingAuth'?: () => Promise<string>;
}) {
  Object.assign(actionsMocks, mocks);

  if (recentBrokerCallSpy) {
    recentBrokerCallSpy.mockRestore();
  }

  const originalBrokerCall = broker.call.bind(broker);

  recentBrokerCallSpy = jest
    .spyOn(broker, 'call')
    .mockImplementation(async (name: string, params: any, meta?: any) => {
      const mockedImplementation: any = (actionsMocks as any)[name];

      return mockedImplementation
        ? mockedImplementation({ params })
        : originalBrokerCall(name as any, params, meta);
    });

  return recentBrokerCallSpy;
}

export function mockExternalServices(
  mocks: {
    'authz.getUser'?: (args: {
      params: AuthzApi.GetUserParams;
    }) => Promise<AuthzApi.GetUserResponse>;
  } = {}
) {
  if (recentBrokerCallSpy) {
    recentBrokerCallSpy.mockRestore();
  }

  const originalBrokerCall = broker.call.bind(broker);

  recentBrokerCallSpy = jest
    .spyOn(broker, 'call')
    .mockImplementation(async (name: string, params: any, meta?: any) => {
      const implementation: any = (mocks as any)[name];

      return implementation
        ? implementation({ params })
        : originalBrokerCall(name as any, params, meta);
    });

  return recentBrokerCallSpy;
}

export function enableAuth() {
  config.AUTH__GRAPHQL_ENABLE = true;
}

export function disableAuth() {
  config.AUTH__GRAPHQL_ENABLE = false;
}
