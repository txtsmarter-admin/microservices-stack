/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { ExampleEvent } from '@my-app/service-sql-api';

import { CTX } from '../lib/moleculer/broker';

export function eventWithPayload(ctx: CTX<ExampleEvent>) {
  ctx.broker.logger.info(
    `eventWithPayload received id=${ctx.params.id} from ${ctx.nodeID}, name ${ctx.eventName}`
  );
}
