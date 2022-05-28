import * as jf from 'joiful';
import { ID } from '../types/id';
import { EUserStatus } from '../types/user.status';

export class UpdateUserParams {
  @jf.string().required()
  id!: ID;

  @jf.string().optional()
  firstName?: string;

  @jf.string().optional()
  lastName?: string;

  @jf.string().optional()
  username?: string;

  @jf.string().optional()
  password?: string;

  @jf.string().optional()
  phoneNumber?: string;

  @jf.string().optional().valid(Object.values(EUserStatus))
  status?: EUserStatus;

  @jf.date().optional()
  lastLogin?: Date | null;
}

export class UpdateUserResponse {
  @jf.string().required()
  id!: ID;

  @jf.string().required()
  firstName!: string;

  @jf.string().required()
  lastName!: string;

  @jf.string().required()
  username!: string;

  @jf.string().required()
  phoneNumber!: string | null;

  @jf.string().required().valid(Object.values(EUserStatus))
  status!: EUserStatus;

  @jf.date().required().allow(null)
  lastLogin!: Date | null;
}
