import * as jf from 'joiful';

export class Pagination {
  @jf.number().required().integer().min(0)
  page!: number;

  @jf.number().required().integer().min(1)
  pageLength!: number;
}
