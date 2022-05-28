/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { Permissions } from '../types/auth.types';
import { ID } from '../types/id';

export class GetUserPermissionsParams {
  @jf.string().required()
  userId!: ID;
}

export class GetUserPermissionsResponse {
  @jf.string().required()
  userId!: ID;

  @jf.object().required()
  permissions!: Permissions;
}
