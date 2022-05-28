/**
 * External api for other services
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import { NIL as NIL_UUID } from 'uuid';
import {
  GenericActionWithParameters as Action,
  GenericActionWithoutParameters as ActionNoParams,
  GenericEventWithoutPayload as EventNoParams
} from 'typed-moleculer';
import { AddUserParams, AddUserResponse } from './params/add.user.params';
import { GetUserParams, GetUserResponse } from './params/get.user.params';
import {
  GetUserPermissionsParams,
  GetUserPermissionsResponse
} from './params/get.user.permissions.params';
import { GetUsersParams, GetUsersResponse } from './params/get.users.params';
import {
  GetUsersByIdParams,
  GetUsersByIdResponse
} from './params/get.users.by.id.params';
import {
  GetUserPermissionsOfManyUsersParams,
  GetUserPermissionsOfManyUsersResponse
} from './params/get.user.permissions.of.many.users';
import {
  UpdateUserParams,
  UpdateUserResponse
} from './params/update.user.params';
import {
  ResetPasswordConfirmParams,
  ResetPasswordConfirmResponse
} from './params/reset.password.confirm.params';
import {
  ResetPasswordDemandParams,
  ResetPasswordDemandResponse
} from './params/reset.password.demand.params';
import {
  InviteUserParams,
  InviteUserResponse
} from './params/invite.user.params';
import {
  AcceptInvitationParams,
  AcceptInvitationResponse
} from './params/accept.invitation';
import {
  ResendInvitationParams,
  ResendInvitationResponse
} from './params/resend.invitation.params';
import {
  GetUsersByPermissionsParams,
  GetUsersByPermissionsResponse
} from './params/get.users.by.permissions.params';

export type ServiceName = 'authz';
export const serviceName: ServiceName = 'authz';

export type AppActions = 'manage' | 'read' | 'write';

export type AppSubjects = 'all' | 'authz';

export type ServiceActions =
  | ActionNoParams<'authz.ping', string>
  | ActionNoParams<'authz.pingAuth', string>
  | Action<
      'authz.acceptInvitation',
      AcceptInvitationParams,
      AcceptInvitationResponse
    >
  | Action<'authz.addUser', AddUserParams, AddUserResponse>
  | Action<'authz.getUser', GetUserParams, GetUserResponse>
  | Action<'authz.getUsers', GetUsersParams, GetUsersResponse>
  | Action<'authz.getUsersById', GetUsersByIdParams, GetUsersByIdResponse>
  | Action<'authz.getAllSubclientUsers', GetUsersParams, GetUsersResponse>
  | Action<
      'authz.getUserPermissions',
      GetUserPermissionsParams,
      GetUserPermissionsResponse
    >
  | Action<
      'authz.getUserPermissionsOfManyUsers',
      GetUserPermissionsOfManyUsersParams,
      GetUserPermissionsOfManyUsersResponse
    >
  | Action<
      'authz.resetPasswordConfirm',
      ResetPasswordConfirmParams,
      ResetPasswordConfirmResponse
    >
  | Action<
      'authz.resetPasswordDemand',
      ResetPasswordDemandParams,
      ResetPasswordDemandResponse
    >
  | Action<'authz.inviteUser', InviteUserParams, InviteUserResponse>
  | Action<
      'authz.resendInvitation',
      ResendInvitationParams,
      ResendInvitationResponse
    >
  | Action<
      'authz.getUsersByPermissions',
      GetUsersByPermissionsParams,
      GetUsersByPermissionsResponse
    >
  | Action<'authz.updateUser', UpdateUserParams, UpdateUserResponse>;

export type ServiceEvent = EventNoParams<''>;

export const ROOT_USER__ID = NIL_UUID;

export * from './params/accept.invitation';
export * from './params/add.user.params';
export * from './params/get.user.params';
export * from './params/get.users.params';
export * from './params/get.users.by.id.params';
export * from './params/get.user.permissions.params';
export * from './params/get.user.permissions.of.many.users';
export * from './params/reset.password.confirm.params';
export * from './params/invite.user.params';
export * from './params/update.user.params';
export * from './params/reset.password.demand.params';
export * from './params/resend.invitation.params';
export * from './params/get.users.by.permissions.params';

export * from './types';
export * from './utils';
