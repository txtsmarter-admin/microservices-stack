import { ObjectType, Field, InputType } from 'type-graphql';
import * as AuthzApi from '@my-app/authz-api';
import { RequiredExact } from '../../../lib/type.utils';

export enum EAuthResult {
  FAIL_USER_PERMISSIONS_INSUFFICIENT = 'FAIL_USER_PERMISSIONS_INSUFFICIENT',
  FAIL_USER_STATUS_ARCHIVED = 'FAIL_USER_STATUS_ARCHIVED',
  FAIL_USER_STATUS_INVITED = 'FAIL_USER_STATUS_INVITED',
  FAIL_USER_STATUS_NOT_ACTIVE = 'FAIL_USER_STATUS_NOT_ACTIVE',
  FAIL_INVALID_CREDENTIALS = 'FAIL_INVALID_CREDENTIALS',
  OK = 'OK'
}

@ObjectType()
export class AuthResponse {
  @Field(() => EAuthResult)
  result!: EAuthResult;
}

@ObjectType()
export class AuthStatusResponse {
  @Field(() => Boolean)
  isLoggedIn!: boolean;
}

@InputType()
export class AuthViaUsernamePasswordQuery {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
export class AuthWhoAmIResponse
  implements RequiredExact<AuthzApi.GetUserResponse, AuthWhoAmIResponse>
{
  @Field(() => String)
  id!: AuthzApi.ID;

  @Field(() => AuthzApi.EUserStatus)
  status!: AuthzApi.EUserStatus;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  username!: string;

  @Field(() => String)
  phoneNumber!: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
