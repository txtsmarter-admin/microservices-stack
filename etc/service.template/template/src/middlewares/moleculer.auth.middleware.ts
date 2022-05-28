/**
 * Middleware for athenticating a jwt
 * Copyright MyCompany 2022. All rights reserved.
 */
import Moleculer, { ActionSchema, Context } from 'moleculer';
import * as jf from 'joiful';
import { Auth } from '@my-app/authz-api';
import { CustomActionSchema } from 'typed-moleculer';

import { CTX } from '../lib/moleculer/broker';
import { MoleculerError } from '../lib/common.utils';

export const authenticateMoleculerContext = (ctx: CTX): void => {
  if (!ctx.meta.auth) {
    throw new MoleculerError(`Missing meta.auth`, 401, 'UNAUTHORIZED', ctx);
  }

  const { error } = jf.validateAsClass(ctx.meta.auth, Auth, {
    allowUnknown: true
  });
  if (error) {
    throw new MoleculerError(
      `Invalid meta.auth. Details: ${error}`,
      401,
      'UNAUTHORIZED',
      ctx.meta.auth
    );
  }
};

export function getAuthMiddleware(authenticator: (ctx: CTX) => void) {
  const AuthMiddleware: Moleculer.Middleware = {
    localAction(
      next: (ctx: Context) => any,
      action: ActionSchema & CustomActionSchema
    ) {
      // If action is restricted, authenticate
      if (action.restricted === true) {
        return function authAction(this: Moleculer.ServiceBroker, ctx: CTX) {
          authenticator(ctx);
          return next(ctx);
        };
      }

      // Otherwise, just return handler
      return next;
    }
  };

  return AuthMiddleware;
}
