import * as jf from 'joiful';
import { ID } from '../types/id';

export class ResetPasswordDemandParams {
  @jf.string().required()
  userId!: ID;

  @jf.boolean().optional()
  forgotPassword?: boolean;
}

export class ResetPasswordDemandResponse {}
