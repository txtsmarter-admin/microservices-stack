/**
 * Entry point for service unit tests.
 * Uses the moleculer microservices framework.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

import { Service as MoleculerService } from 'moleculer';
import { WelcomeResponse } from '@my-app/service-mongo-api';

import { globalSetup, globalTearDown } from './setup';
import { resetServiceDB } from './utils';
import { startAll, stopAll } from '../src/start.stop.all';
import { getService } from '../src/lib/start.service.and.broker';
import { broker } from '../src/lib/moleculer/broker';
import { sudoCall } from '../src/lib/common.utils';

describe('ServiceMongo unit tests', () => {
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

  beforeEach(async () => {
    await resetServiceDB();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Ping test', async () => {
    // call an action without a parameter object
    const response: string = await broker.call('service-mongo.ping');
    expect(response).toBe('Hello World!');
  });

  test('Action with required parameter', async () => {
    // call an action with a parameter object
    const response = await broker.call(
      'service-mongo.welcome',
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
        'service-mongo.welcome',
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

  test('Test database entity creation', async () => {
    // create a sample entity
    const entityId = await broker.call(
      'service-mongo.addTestEntity',
      {
        aKey: 'A Key',
        aValue: 'A Value'
      },
      sudoCall
    );

    expect(entityId).toBeTruthy();
  });

  test('Test database entity update', async () => {
    // create a sample entity
    const responseWithId = await broker.call(
      'service-mongo.addTestEntity',
      {
        aKey: 'A Key',
        aValue: 'A Value'
      },
      sudoCall
    );

    expect(responseWithId).toMatchObject({ id: expect.stringMatching(/\w+/) });

    const updatedEntityId = await broker.call(
      'service-mongo.editTestEntity',
      {
        id: responseWithId.id,
        aKey: 'Another Key',
        aValue: 'Another Value'
      },
      sudoCall
    );

    expect(updatedEntityId).toStrictEqual({ ok: true });
  });
});
