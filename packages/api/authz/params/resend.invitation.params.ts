/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { ID } from '../types/id';
import { EResendInvitationResponse } from '../types/resend.invitation.response';

export class ResendInvitationParams {
  @jf.string().required()
  id!: ID;
}

export class ResendInvitationResponse {
  @jf.string().required().valid(Object.values(EResendInvitationResponse))
  result!: EResendInvitationResponse;
}
