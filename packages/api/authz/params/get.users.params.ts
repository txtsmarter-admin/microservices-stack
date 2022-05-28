/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { Pagination } from './common.params';
import { ID, UserShortInfo, GetUsersCommonQuery } from '../types';

export class UserInfo {
  @jf.string().required()
  id!: ID;

  @jf.string().required()
  firstName!: string;

  @jf.string().required()
  lastName!: string;

  @jf.string().required()
  username!: string;

  @jf.string().optional()
  phoneNumber?: string | null;

  @jf.date().required()
  createdAt!: Date;

  @jf.date().required()
  updatedAt!: Date;
}

export class GetUsersParamsQuery extends GetUsersCommonQuery {}

export class GetUsersParams {
  @jf.object().required()
  pagination!: Pagination;

  @jf.object().required()
  query!: GetUsersParamsQuery;
}
export class GetUsersResponse {
  @jf.number().required()
  totalCount!: number;

  @jf.array({ elementClass: UserShortInfo }).required()
  results!: UserShortInfo[];
}
