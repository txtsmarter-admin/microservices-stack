/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import * as jf from 'joiful';

export class AddTestEntityParams {
  @jf.string().required()
  aKey!: string;

  @jf.string().required()
  aValue!: string;
}

export class AddTestEntityResponse {
  @jf.string().required()
  id!: string;
}
