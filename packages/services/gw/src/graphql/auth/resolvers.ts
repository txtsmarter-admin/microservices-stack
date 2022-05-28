/* eslint-disable class-methods-use-this */

import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Authorized,
  Mutation,
  registerEnumType
} from 'type-graphql';
import jwt from 'jsonwebtoken';
import * as AuthzApi from '@my-app/authz-api';
import { EUserStatus } from '@my-app/authz-api';
import { ResolverContext } from '../interfaces';
import * as authUtils from './auth.utils';
import {
  AuthResponse,
  AuthViaUsernamePasswordQuery,
  AuthStatusResponse,
  AuthWhoAmIResponse,
  EAuthResult
} from './types/auth.types';
import { config } from '../../lib/env';
import { broker } from '../../lib/moleculer/broker';
import { sudoCall } from '../../lib/common.utils';
import { exact, Normalize } from '../../lib/type.utils';

registerEnumType(EAuthResult, { name: 'EAuthResult' });

@Resolver()
export class AuthResolver {
  @Mutation(() => AuthResponse)
  async AuthViaUsernamePassword(
    @Arg('query') query: AuthViaUsernamePasswordQuery,
    @Ctx() ctx: ResolverContext
  ): Promise<AuthResponse> {
    const { response } = ctx;

    const { username, password } = query;

    const userWithToken_or_error = await authUtils
      .getUserAndMyAppIdToken({ username, password })
      .catch((err: Error) => err);

    if (userWithToken_or_error instanceof Error) {
      const err = userWithToken_or_error;

      throw err;
    }

    const { user, myAppIdToken } = userWithToken_or_error;

    if (user.status === EUserStatus.active) {
      response.state(authUtils.MYAPP_ID_TOKEN_COOKIE, myAppIdToken);

      return { result: EAuthResult.OK };
    }

    switch (user.status) {
      case EUserStatus.invited:
        return { result: EAuthResult.FAIL_USER_STATUS_INVITED };
      case EUserStatus.archived:
        return { result: EAuthResult.FAIL_USER_STATUS_ARCHIVED };
      default:
        return { result: EAuthResult.FAIL_USER_STATUS_NOT_ACTIVE };
    }
  }

  @Mutation(() => AuthResponse)
  async AuthLogout(@Ctx() ctx: ResolverContext): Promise<AuthResponse> {
    const { response } = ctx;

    response.unstate(authUtils.MYAPP_ID_TOKEN_COOKIE);

    return { result: EAuthResult.OK };
  }

  @Query(() => AuthStatusResponse)
  async AuthStatus(@Ctx() ctx: ResolverContext): Promise<AuthStatusResponse> {
    const { request } = ctx;

    let isLoggedIn: boolean;
    const idToken = request.state[authUtils.MYAPP_ID_TOKEN_COOKIE];

    try {
      isLoggedIn = true;
      jwt.verify(idToken, config.AUTH__JWT_KEY);
    } catch (err: any) {
      isLoggedIn = false;
    }

    return { isLoggedIn };
  }

  @Authorized()
  @Query(() => AuthResponse)
  async AuthTest(): Promise<AuthResponse> {
    return { result: EAuthResult.OK };
  }

  @Authorized()
  @Query(() => AuthWhoAmIResponse)
  async AuthWhoAmI(
    @Ctx() ctx: ResolverContext
  ): Promise<Normalize<AuthWhoAmIResponse>> {
    const params: AuthzApi.GetUserParams = { id: ctx.auth.userId };
    const userData = await broker.call('authz.getUser', params, sudoCall);

    const response = {
      ...userData
    };
    return exact<Normalize<AuthWhoAmIResponse>, typeof response>(response);
  }
}
