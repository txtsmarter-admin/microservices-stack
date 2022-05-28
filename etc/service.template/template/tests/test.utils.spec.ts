import { WelcomeResponse } from '@my-app/{{serviceName}}-api';
import { mockBrokerCall } from './test.utils';
import * as api from './test.api.helpers';
import { startAll, stopAll } from '../src/start.stop.all';
import { globalSetup, globalTearDown } from './setup';

describe('mockBrokerCall', () => {
  beforeAll(async () => {
    await globalSetup();
    await startAll();
  });

  afterAll(async () => {
    await stopAll();
    await globalTearDown();
  });

  test('Basic test', async () => {
    async function expectWelcomeReturns(name: string, expectedValue: string) {
      await expect(api.welcome({ name })).resolves.toStrictEqual({
        greetings: expectedValue
      } as WelcomeResponse);
    }
    async function expectPingReturns(expectedValue: string) {
      await expect(api.pingAuth()).resolves.toStrictEqual(expectedValue);
    }

    // --------------------
    //
    await expectWelcomeReturns('namE', `Welcome namE; caller: test-suite!`);
    await expectPingReturns('Hello World!');

    // --------------------
    //
    mockBrokerCall({
      '{{serviceName}}.welcome': async args => ({
        greetings: `Mock one ${args.params.name}`
      })
    });
    await expectWelcomeReturns('namE', 'Mock one namE');
    await expectPingReturns('Hello World!');

    // --------------------
    //
    mockBrokerCall({
      '{{serviceName}}.welcome': async args => ({
        greetings: `Mock two ${args.params.name}`
      }),
      '{{serviceName}}.pingAuth': async () => 'pong 1'
    });
    await expectWelcomeReturns('namE', 'Mock two namE');
    await expectPingReturns('pong 1');

    // --------------------
    //
    mockBrokerCall({
      '{{serviceName}}.pingAuth': async () => 'pong 2'
    });
    await expectWelcomeReturns('namE', 'Mock two namE');
    await expectPingReturns('pong 2');
  });

  test('Mocks should be cleared after previous test', async () => {
    await expect(api.welcome({ name: 'xxx' })).resolves.toStrictEqual({
      greetings: expect.stringMatching(/^Welcome xxx/)
    } as WelcomeResponse);

    await expect(api.pingAuth()).resolves.toStrictEqual('Hello World!');
  });
});
