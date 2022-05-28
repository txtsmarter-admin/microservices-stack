/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import * as jf from 'joiful';

export class ExampleEvent {
  @jf.string().required()
  id!: string;
}
