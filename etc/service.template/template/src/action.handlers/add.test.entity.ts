/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import {
  AddTestEntityParams,
  AddTestEntityResponse
} from '@my-app/{{serviceName}}-api';

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

  {{#unless mongo}}
  em.persist([testEntity]);
  {{/unless}}
  {{#if mongo}}
  await em.persistAndFlush([testEntity]); // need to flush to get ID to send back
  {{/if}}

  const response = { id: testEntity.id };
  return exact<AddTestEntityResponse, typeof response>(response);
}
