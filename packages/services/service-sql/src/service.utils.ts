import * as AuthzApi from '@my-app/authz-api';
import { AppSubjects, AppActions } from '@my-app/service-sql-api';
import { PureAbility } from '@casl/ability';

import { commonAuthorize } from './lib/common.utils';

type ApiAbility = PureAbility<[AppActions, AppSubjects]>;

export function authorize(ctx: { meta: { auth: AuthzApi.Auth } }) {
  return commonAuthorize<ApiAbility>(ctx);
}
