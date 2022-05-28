/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import * as jf from 'joiful';

export class WelcomeParams {
  @jf.string().required()
  name!: string;
}

export class WelcomeResponse {
  @jf.string().required()
  greetings!: string;
}
