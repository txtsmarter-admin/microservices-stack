/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { EAcceptInvitationResponse } from '../types/accept.invitation.response';

export class AcceptInvitationParams {
  @jf.string().required()
  invitationToken!: string;

  @jf.string().optional()
  newPassword?: string;
}

export class AcceptInvitationResponse {
  @jf.string().required().valid(Object.values(EAcceptInvitationResponse))
  result!: EAcceptInvitationResponse;
}
