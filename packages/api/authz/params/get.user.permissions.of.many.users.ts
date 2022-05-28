import * as jf from 'joiful';
import { Permissions } from '../types/auth.types';
import { ID } from '../types/id';

export class GetUserPermissionsOfManyUsersParams {
  @jf.array().required()
  userIds!: ID[];
}

export class UserPermissions {
  @jf.string().required()
  userId!: ID;

  @jf.object().required()
  permissions!: Permissions;
}

export class GetUserPermissionsOfManyUsersResponse {
  @jf.array({ elementClass: UserPermissions }).required()
  results!: UserPermissions[];
}
