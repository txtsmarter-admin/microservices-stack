/**
 * Entry point for service unit tests.
 * Uses the moleculer microservices framework.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

import { Service as MoleculerService } from 'moleculer';
import { WelcomeResponse } from '@my-app/gw-api';

import { globalSetup, globalTearDown } from './setup';
import { startAll, stopAll } from '../src/start.stop.all';
import { getService } from '../src/lib/start.service.and.broker';
import { broker } from '../src/lib/moleculer/broker';
import { sudoCall } from '../src/lib/common.utils';

describe('Gw unit tests', () => {
  let service: MoleculerService;

  beforeAll(async () => {
    await globalSetup(); // has to be first

    await startAll();
    service = await getService();
  });

  afterAll(async () => {
    await stopAll();

    await globalTearDown(); // has to be last
  });

  beforeEach(async () => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Ping test', async () => {
    // call an action without a parameter object
    const response: string = await broker.call('gw.ping');
    expect(response).toBe('Hello World!');
  });

  test('Action with required parameter', async () => {
    // call an action with a parameter object
    const response = await broker.call(
      'gw.welcome',
      {
        name: 'John Doe'
      },
      sudoCall
    );
    const expectedResponse: WelcomeResponse = {
      greetings: `Welcome John Doe; caller: ${sudoCall.caller}!`
    };

    expect(response).toStrictEqual(expectedResponse);
  });

  test('Action with unauthenticated call should throw', async () => {
    // call an action with a parameter object
    try {
      await broker.call(
        'gw.welcome',
        {
          mistake: 'invalid property name'
        } as any,
        { caller: 'jest' }
      );
      // eslint-disable-next-line no-undef
      fail(`Expected ValidationError.`);
    } catch (err: any) {
      expect(err.code).toBe(401);
    }
  });

  test('Event without parameter', async () => {
    // create a spy to look at events
    const spy = jest.spyOn(service, 'eventTester');

    // emit an event as well so that that can get tested. no return on event
    await (broker as any).emit('eventWithoutPayload', undefined);

    expect(spy).toBeCalledTimes(1);
  });

  test('Event with required parameter', async () => {
    // create a spy to look at events
    const spy = jest.spyOn(service, 'eventTester');

    // emit an event as well so that that can get tested. no return on event
    await (broker as any).emit('eventWithPayload', { id: '1234' });

    expect(spy).toBeCalledTimes(1);
  });
});
