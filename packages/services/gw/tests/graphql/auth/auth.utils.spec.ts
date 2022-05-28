import {
  GetUserResponse,
  GetUserPermissionsResponse,
  Auth
} from '@my-app/authz-api';
import jwt from 'jsonwebtoken';
// eslint-disable-next-line import/no-unresolved
import { PartialDeep } from 'type-fest';
import { broker } from '../../../src/lib/moleculer/broker';
import {
  getUserAndMyAppIdToken,
  getAuthFromBearerToken,
  getAuthFromCookieToken,
  MyAppIdTokenPayload
} from '../../../src/graphql/auth/auth.utils';
import { sudoCall, MoleculerError } from '../../../src/lib/common.utils';
import { config } from '../../../src/lib/env';
import { mockExternalServices } from '../../test.utils';

describe(`getAuthFromCookeToken()`, () => {
  const userId = '1';

  let callSpy: jest.SpyInstance;

  beforeEach(() => {
    callSpy = mockExternalServices({
      'authz.getUser': async () => {
        const user: PartialDeep<GetUserResponse> = {
          id: userId
        };
        return user as any;
      }
    });
  });

  test(`by username & password`, async () => {
    const userData = { username: 'u', password: 'p' };
    await getUserAndMyAppIdToken(userData);

    expect(callSpy).toHaveBeenCalledTimes(1);
    expect(callSpy).toHaveBeenNthCalledWith(
      1,
      'authz.getUser',
      userData,
      sudoCall
    );
  });
});

describe(`getAuth()`, () => {
  const userId = '123';
  const permissions: GetUserPermissionsResponse = {
    userId,
    permissions: {
      rules: [{ action: 'manage', subject: 'all', inverted: false }]
    }
  };
  const myAppIdTokenPayload: MyAppIdTokenPayload = {
    firstName: 'John',
    id: userId,
    lastName: 'Doe',
    username: 'uname',
    phoneNumber: '1234567890'
  };

  test(`Success test`, async () => {
    const callSpy = jest
      .spyOn(broker, 'call')
      .mockImplementation(async (name: any) => {
        switch (name) {
          case 'authz.getUser': {
            const user: PartialDeep<GetUserResponse> = {
              id: userId
            };
            return user as any;
          }
          default:
            throw new Error(
              `Test error - missing mock for broker.call('${name}')`
            );
        }
      });

    const idTokenPayloady: MyAppIdTokenPayload = {
      ...myAppIdTokenPayload
    };
    const myAppIdToken: string = jwt.sign(
      idTokenPayloady,
      config.AUTH__JWT_KEY,
      { expiresIn: '1h' }
    );

    const auth = await getAuthFromCookieToken({ myAppIdToken });

    const expectedAuth: Auth = {
      userId,
      permissions: {
        ...permissions.permissions,
        rules: permissions.permissions.rules.map(
          ({ action, subject, inverted }) => ({
            action,
            subject,
            inverted
          })
        )
      }
    };
    expect(auth).toStrictEqual(expectedAuth);

    expect(callSpy).toHaveBeenCalledTimes(1);

    expect(callSpy).toHaveBeenNthCalledWith(
      1,
      'authz.getUser',
      { id: userId },
      sudoCall
    );
  });

  test(`Invalid structure of token body provided`, async () => {
    const idTokenPayloady: MyAppIdTokenPayload = {
      MISSING_userId: 'userId-filed-should-be-here'
    } as any;

    const myAppIdToken: string = jwt.sign(
      idTokenPayloady,
      config.AUTH__JWT_KEY,
      { expiresIn: '1h' }
    );

    const auth = await getAuthFromCookieToken({ myAppIdToken });
    expect(auth).toBe(null);
  });

  test(`Token validation failure`, async () => {
    const idTokenPayloady: MyAppIdTokenPayload = {
      ...myAppIdTokenPayload
    };
    const myAppIdToken: string = jwt.sign(
      idTokenPayloady,
      `${config.AUTH__JWT_KEY}-INVALID-JWT-SECRET`,
      { expiresIn: '1h' }
    );

    const auth = await getAuthFromCookieToken({ myAppIdToken });
    expect(auth).toBe(null);
  });

  test(`authz.getUser fail with 500`, async () => {
    jest.spyOn(broker, 'call').mockImplementation(async (name: any) => {
      switch (name) {
        case 'authz.getUser': {
          throw new MoleculerError('Test error', 500);
        }
        default:
          throw new Error(
            `Test error - missing mock for broker.call('${name}')`
          );
      }
    });

    const idTokenPayloady: MyAppIdTokenPayload = {
      ...myAppIdTokenPayload
    };
    const myAppIdToken: string = jwt.sign(
      idTokenPayloady,
      config.AUTH__JWT_KEY,
      { expiresIn: '1h' }
    );

    await expect(
      getAuthFromCookieToken({ myAppIdToken })
    ).rejects.toMatchObject({ code: 500 });
  });

  test(`authz.getUser fail with 404 (user not found)`, async () => {
    jest.spyOn(broker, 'call').mockImplementation(async (name: any) => {
      switch (name) {
        case 'authz.getUser': {
          throw new MoleculerError('Test error', 404);
        }
        default:
          throw new Error(
            `Test error - missing mock for broker.call('${name}')`
          );
      }
    });

    const idTokenPayloady: MyAppIdTokenPayload = {
      ...myAppIdTokenPayload
    };
    const myAppIdToken: string = jwt.sign(
      idTokenPayloady,
      config.AUTH__JWT_KEY,
      { expiresIn: '1h' }
    );

    await expect(getAuthFromCookieToken({ myAppIdToken })).resolves.toBe(null);
  });
});

describe(`getAuthFromBearerToken()`, () => {
  test('good bearer token', () => {
    const goodAuth: Auth = {
      userId: '0',
      permissions: {
        rules: [{ action: 'foo', subject: 'bar' }]
      }
    };
    const goodToken = jwt.sign(goodAuth, config.AUTH__JWT_KEY);

    const auth = getAuthFromBearerToken({ bearerToken: goodToken });
    expect(auth).toMatchObject(goodAuth);
  });

  test('bad bearer token', () => {
    const badToken = 'dead';

    const auth = getAuthFromBearerToken({ bearerToken: badToken });
    expect(auth).toBeNull();
  });

  test('bad payload', () => {
    const badPayload = {
      foo: 'bar'
    };

    const malformedToken = jwt.sign(badPayload, config.AUTH__JWT_KEY);

    const auth = getAuthFromBearerToken({ bearerToken: malformedToken });
    expect(auth).toBeNull();
  });
});
