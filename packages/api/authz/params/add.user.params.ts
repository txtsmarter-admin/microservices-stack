/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { ID } from '../types/id';
import { EUserStatus } from '../types/user.status';

export class AddUserParams {
  @jf.string().optional().pattern(/\d+/)
  id?: ID | null;

  @jf.string().required()
  firstName!: string;

  @jf.string().required()
  lastName!: string;

  @jf.string().required()
  username!: string;

  @jf.string().required()
  password!: string;

  @jf.string().optional().allow(null, '')
  notes!: string | null;

  @jf.string().required()
  primaryClientId!: ID;

  @jf.string().required().valid(Object.values(EUserStatus))
  status!: EUserStatus;

  @jf.string().required()
  phoneNumber!: string;
}

export class AddUserResponse {
  @jf.string().required()
  id!: ID;
}
