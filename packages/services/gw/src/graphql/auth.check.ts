/**
 * Authorization checker for TypeGraphQL
 *
 */
import { AuthChecker } from 'type-graphql';

import { ResolverContext } from './interfaces';
import { config } from '../lib/env';
import * as authUtils from './auth/auth.utils';

export const graphQlAuthCheck: AuthChecker<ResolverContext> = async ({
  context
}): Promise<boolean> => {
  const { moleculerBroker, myAppIdToken, bearerToken } = context;
  if (!config.AUTH__GRAPHQL_ENABLE) {
    return true;
  }

  if (myAppIdToken) {
    const auth = await authUtils.getAuthFromCookieToken({ myAppIdToken });
    if (!auth) {
      return false;
    }
    context.auth = auth;
  } else if (bearerToken) {
    const auth = authUtils.getAuthFromBearerToken({ bearerToken });
    if (!auth) {
      return false;
    }
    context.auth = auth;
  } else {
    moleculerBroker.logger.error(
      `Authorization failed. Expected id cookie or bearer token to be provided.`
    );
    return false;
  }

  return true; // Valid token, access granted
};
