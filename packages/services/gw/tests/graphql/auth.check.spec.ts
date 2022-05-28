/**
 * Entry point for GraphQL authentication unit tests.
 *
 */
import * as authUtils from '../../src/graphql/auth/auth.utils';
import { config } from '../../src/lib/env';
import { startAll, stopAll } from '../../src/start.stop.all';
import { GqlClient, gqlClient, gql } from '../gql.client';
import { tests } from '../../src/graphql/ping/resolvers';
import { enableAuth } from '../test.utils';

beforeAll(async () => {
  await startAll();
});

afterAll(async () => {
  await stopAll();
});

beforeEach(async () => {
  enableAuth();
});

let authFromCookieTokenSpy: jest.SpyInstance;
let authFromBearerTokenSpy: jest.SpyInstance;

const auth = { stubbed: 'auth value' };

beforeEach(async () => {
  authFromCookieTokenSpy = jest
    .spyOn(authUtils, 'getAuthFromCookieToken')
    .mockResolvedValue(auth as any);

  authFromBearerTokenSpy = jest
    .spyOn(authUtils, 'getAuthFromBearerToken')
    .mockReturnValue(auth as any);
});

test('Disable auth check', async () => {
  // Disabled
  config.AUTH__GRAPHQL_ENABLE = false;

  await gqlClient.request(gql`
    query {
      PingAuthQuery(query: { message: "hello" }) {
        message
      }
    }
  `);

  expect(authFromCookieTokenSpy).toHaveBeenCalledTimes(0);

  // Enabled
  config.AUTH__GRAPHQL_ENABLE = true;

  await gqlClient.request(gql`
    query {
      PingAuthQuery(query: { message: "hello" }) {
        message
      }
    }
  `);
  expect(authFromCookieTokenSpy).toHaveBeenCalledTimes(1);
});

test('Auth failed', async () => {
  authFromCookieTokenSpy = jest
    .spyOn(authUtils, 'getAuthFromCookieToken')
    .mockResolvedValue(null);

  await expect(
    gqlClient.request(gql`
      query {
        PingAuthQuery(query: { message: "hello" }) {
          message
        }
      }
    `)
  ).rejects.toMatchObject({
    message: expect.stringContaining('Access denied!')
  });

  expect(authFromCookieTokenSpy).toHaveBeenCalledTimes(1);
});

test('Call resolver that requires Auth', async () => {
  const ctxSpy = jest.spyOn(tests, 'testCtx');

  await gqlClient.request(gql`
    query {
      PingAuthQuery(query: { message: "hello" }) {
        message
      }
    }
  `);

  expect(authFromCookieTokenSpy).toHaveBeenCalledTimes(1);
  expect(ctxSpy).toHaveBeenCalledTimes(1);
  expect((ctxSpy.mock.calls[0][0] as any).auth).toStrictEqual(auth);
});

test('Call resolver without Auth', async () => {
  const ctxSpy = jest.spyOn(tests, 'testCtx');

  await gqlClient.request(gql`
    query {
      PingNoAuthQuery(query: { message: "hello" }) {
        message
      }
    }
  `);

  expect(authFromCookieTokenSpy).toHaveBeenCalledTimes(0);
  expect(ctxSpy).toHaveBeenCalledTimes(1);
  expect((ctxSpy.mock.calls[0][0] as any).auth).toStrictEqual(undefined);
});

test('Call retricted resolver with bearer token', async () => {
  const ctxSpy = jest.spyOn(tests, 'testCtx');

  const clientWithBearerToken = new GqlClient({
    url: `http://localhost:${config.GRAPHQL__SERVER_PORT}/graphql`,
    bearerToken: 'dead'
  });

  await clientWithBearerToken.request(gql`
    query {
      PingAuthQuery(query: { message: "hello" }) {
        message
      }
    }
  `);

  expect(authFromBearerTokenSpy).toHaveBeenCalledTimes(1);
  expect(ctxSpy).toHaveBeenCalledTimes(1);
  expect((ctxSpy.mock.calls[0][0] as any).auth).toStrictEqual(auth);
});

test('Call restricted resolver with no auth', async () => {
  const clientWithNoAuth = new GqlClient({
    url: `http://localhost:${config.GRAPHQL__SERVER_PORT}/graphql`
  });

  const result = clientWithNoAuth.request(gql`
    query {
      PingAuthQuery(query: { message: "hello" }) {
        message
      }
    }
  `);

  await expect(result).rejects.toThrow();
});

test('Call restricted resolver with bad bearer token', async () => {
  authFromBearerTokenSpy = jest
    .spyOn(authUtils, 'getAuthFromBearerToken')
    .mockReturnValue(null);

  const clientWithBearerToken = new GqlClient({
    url: `http://localhost:${config.GRAPHQL__SERVER_PORT}/graphql`,
    bearerToken: 'dead'
  });

  const result = clientWithBearerToken.request(gql`
    query {
      PingAuthQuery(query: { message: "hello" }) {
        message
      }
    }
  `);

  await expect(result).rejects.toThrow();
});

test('Call Ping resolver without Auth', async () => {
  const ctxSpy = jest.spyOn(tests, 'testCtx');

  await gqlClient.request(gql`
    query {
      Ping
    }
  `);

  expect(authFromCookieTokenSpy).toHaveBeenCalledTimes(0);
  expect(ctxSpy).toHaveBeenCalledTimes(1);
  expect((ctxSpy.mock.calls[0][0] as any).auth).toStrictEqual(undefined);
});
