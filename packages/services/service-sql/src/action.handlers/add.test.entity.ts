/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import {
  AddTestEntityParams,
  AddTestEntityResponse
} from '@my-app/service-sql-api';

import { CTX } from '../lib/moleculer/broker';
import { TestEntity } from '../entities/index';
import { exact } from '../lib/type.utils';

export async function addTestEntity(
  ctx: CTX<AddTestEntityParams>
): Promise<AddTestEntityResponse> {
  const em = ctx.entityManager;

  const testEntity = new TestEntity({
    aKey: ctx.params.aKey,
    aValue: ctx.params.aValue
  });

  em.persist([testEntity]);

  const response = { id: testEntity.id };
  return exact<AddTestEntityResponse, typeof response>(response);
}
