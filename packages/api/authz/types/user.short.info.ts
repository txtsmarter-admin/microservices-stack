import * as jf from 'joiful';
import { ID, EUserStatus } from '.';

export class GetUsersCommonQuery {
  @jf.string().required()
  clientId!: ID;

  @jf.string().optional().allow('')
  firstNameLike?: string;

  @jf.string().optional().allow('')
  lastNameLike?: string;

  @jf.string().optional().allow('')
  phoneNumberLike?: string;

  @jf.string().optional().allow('')
  usernameLike?: string;

  @jf
    .array()
    .optional()
    .items(joi => joi.valid(...Object.keys(EUserStatus)))
    .min(1)
  status?: EUserStatus[];
}

export class UserShortInfo {
  @jf.string().required()
  id!: ID;

  @jf.string().required()
  firstName!: string;

  @jf.string().required()
  lastName!: string;

  @jf.string().required()
  username!: string;

  @jf.string().required().allow(null)
  phoneNumber!: string | null;

  @jf.date().required()
  createdAt!: Date;

  @jf.date().required().allow(null)
  lastLogin!: Date | null;

  @jf.string().required().valid(Object.keys(EUserStatus))
  status!: EUserStatus;
}
