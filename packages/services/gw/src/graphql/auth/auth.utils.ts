import jwt from 'jsonwebtoken';

import * as jf from 'joiful';
import _ from 'lodash';
import { config } from '../../lib/env';
import { broker } from '../../lib/moleculer/broker';
import { sudoCall } from '../../lib/common.utils';
import * as AuthzApi from '@my-app/authz-api';

const { AUTH__JWT_KEY, AUTH__EXPIRES_IN } = config;
export const MYAPP_ID_TOKEN_COOKIE = 'myAppIdToken';

export class MyAppIdTokenPayload {
  @jf.string().required()
  id!: AuthzApi.ID;

  @jf.string().required()
  username!: string;

  @jf.string().required()
  firstName!: string;

  @jf.string().required()
  lastName!: string;

  @jf.string().required()
  phoneNumber!: string;
}

// ---------------------------------------------------------------------

export async function getUserAndMyAppIdToken(userData: {
  username: string;
  password: string;
}): Promise<{ user: AuthzApi.GetUserResponse; myAppIdToken: string }> {
  const myAppUser = await broker.call('authz.getUser', userData, sudoCall);

  const tokenPayload: MyAppIdTokenPayload = {
    id: myAppUser.id,
    username: myAppUser.username,
    firstName: myAppUser.firstName,
    lastName: myAppUser.lastName,
    phoneNumber: myAppUser.phoneNumber || '1234567890'
  };

  const myAppIdToken = jwt.sign(tokenPayload, AUTH__JWT_KEY, {
    expiresIn: AUTH__EXPIRES_IN
  });

  return {
    user: myAppUser,
    myAppIdToken
  };
}

// ---------------------------------------------------------------------

export async function getAuthFromCookieToken(args: {
  myAppIdToken: string;
}): Promise<null | AuthzApi.Auth> {
  const { myAppIdToken } = args;
  let tokePayload: null | MyAppIdTokenPayload = null;
  try {
    tokePayload = jwt.verify(
      myAppIdToken,
      AUTH__JWT_KEY
    ) as MyAppIdTokenPayload & { iat: number; exp: number };
  } catch (err: any) {
    broker.logger.warn(`id token verification fail: ${err}`);
    return null;
  }

  tokePayload = _.omit(tokePayload, 'iat', 'exp');

  const { error } = jf.validateAsClass(tokePayload, MyAppIdTokenPayload, {
    allowUnknown: true
  });
  if (error) {
    broker.logger.warn(
      `Invalid id token structure spotted. Token: "${myAppIdToken}". Error: ${error}`
    );
    return null;
  }

  const [userInfo] = await Promise.all([
    broker.call('authz.getUser', { id: tokePayload.id }, sudoCall)
  ]).catch(err => {
    broker.logger.warn('Service error:', err);
    if (err.code && err.code === 404 && err.type !== 'SERVICE_NOT_FOUND') {
      return [null, null];
    }
    throw err;
  });

  if (!userInfo) {
    return null;
  }

  const auth: AuthzApi.Auth = {
    userId: tokePayload.id,
    // TODO: Fix the following line to actually get the real permissions of the user
    permissions: {
      rules: [{ action: 'manage', subject: 'all', inverted: false }]
    }
  };

  return auth;
}

export function getAuthFromBearerToken(args: {
  bearerToken: string;
}): AuthzApi.Auth | null {
  const { bearerToken } = args;
  let auth: null | AuthzApi.Auth = null;
  try {
    auth = jwt.verify(bearerToken, AUTH__JWT_KEY) as AuthzApi.Auth & {
      iat: number;
      exp: number;
    };
  } catch (err: any) {
    broker.logger.warn(`Bearer token verification fail: ${err}`);
    return null;
  }

  auth = _.omit(auth, 'iat', 'exp');

  const { error } = jf.validateAsClass(auth, AuthzApi.Auth, {
    allowUnknown: true
  });
  if (error) {
    broker.logger.warn(
      `Invalid bearer token structure spotted. Token: "${bearerToken}". Error: ${error}`
    );
    return null;
  }

  return auth;
}
