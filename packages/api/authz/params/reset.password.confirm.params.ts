/**
 * Copyright MyCompany 2020. All rights reserved.
 */
import * as jf from 'joiful';
import { EResetPasswordConfirm } from '../types/reset.password.confirm';

export class ResetPasswordConfirmParams {
  @jf.string().required()
  resetPasswordToken!: string;

  @jf.string().optional()
  newPassword?: string;
}

export class ResetPasswordConfirmResponse {
  @jf.string().required().valid(Object.values(EResetPasswordConfirm))
  result!: EResetPasswordConfirm;
}
