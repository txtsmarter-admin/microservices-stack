/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { ID } from '../types/id';

export class UserByIdInfo {
  @jf.string().required()
  id!: ID;

  @jf.string().optional()
  firstName?: string;

  @jf.string().optional()
  lastName?: string;

  @jf.string().optional()
  username?: string;

  @jf.string().optional()
  phoneNumber?: string | null;
}

export class GetUsersByIdParams {
  @jf.array().items(joi => joi.string().allow(''))
  usersIds!: string[];
}

export class GetUsersByIdResponse {
  @jf.array({ elementClass: UserByIdInfo }).required()
  results!: UserByIdInfo[];
}
