/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import {
  EditTestEntityParams,
  EditTestEntityResponse
} from '@my-app/service-sql-api';

import { CTX } from '../lib/moleculer/broker';
import { TestEntity } from '../entities/index';
import { exact } from '../lib/type.utils';

export async function editTestEntity(
  ctx: CTX<EditTestEntityParams>
): Promise<EditTestEntityResponse> {
  const em = ctx.entityManager;
  const testEntity = await em.findOneOrFail<TestEntity>(TestEntity, {
    id: ctx.params.id
  });

  testEntity.aKey = ctx.params.aKey;
  testEntity.aValue = ctx.params.aValue;

  const response = { ok: true };
  return exact<EditTestEntityResponse, typeof response>(response);
}
