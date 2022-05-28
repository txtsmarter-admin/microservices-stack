/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { ID } from '../types/id';
import { EUserStatus } from '../types/user.status';

export class GetUserParams {
  @jf.string().optional()
  id?: ID | null;

  @jf.string().optional()
  username?: string | null;

  @jf.string().optional()
  password?: string | null;
}

export class GetUserResponse {
  @jf.string().required()
  id!: ID;

  @jf.string().required()
  firstName!: string;

  @jf.string().required()
  lastName!: string;

  @jf.string().required()
  username!: string;

  @jf.string().required().valid(Object.values(EUserStatus))
  status!: EUserStatus;

  @jf.string().optional()
  phoneNumber?: string | null;

  @jf.date().required()
  createdAt!: Date;

  @jf.date().required()
  updatedAt!: Date;
}
