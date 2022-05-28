/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import * as jf from 'joiful';

export class EditTestEntityParams {
  @jf.string().required()
  id!: string;

  @jf.string().required()
  aKey!: string;

  @jf.string().required()
  aValue!: string;
}

export class EditTestEntityResponse {
  @jf.boolean().required().valid(true)
  ok!: boolean;
}
