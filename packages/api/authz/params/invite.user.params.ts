/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';

import { ID } from '../types/id';

export class InviteUserParams {
  @jf.string().optional()
  id?: ID | null;

  @jf.string().required()
  firstName!: string;

  @jf.string().required()
  lastName!: string;

  @jf.string().required()
  username!: string;

  @jf.string().optional().allow(null, '')
  password?: string | null;

  @jf.string().optional().empty('')
  phoneNumber?: string;
}

export class InviteUserResponse {
  @jf.string().required()
  id!: ID;
}
