/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { UserShortInfo, GetUsersCommonQuery } from '../types';
import { Pagination } from './common.params';

export class WherePermission {
  @jf.string().required()
  action!: string;

  @jf.string().required()
  subject!: string;
}

export class UserWithPasswordInfo extends UserShortInfo {
  @jf.string().required()
  passwordHash!: string;
}

export class GetUsersByPermissionsQuery extends GetUsersCommonQuery {
  @jf.boolean().optional()
  adminsOnly?: boolean;

  @jf.object({ objectClass: WherePermission }).required()
  where!: WherePermission;
}
export class GetUsersByPermissionsParams {
  @jf.object().optional()
  pagination?: Pagination;

  @jf.object().required()
  query!: GetUsersByPermissionsQuery;
}

export class GetUsersByPermissionsResponse {
  @jf.array({ elementClass: UserWithPasswordInfo }).required()
  results!: UserWithPasswordInfo[];

  @jf.number().required()
  totalCount!: number;
}
