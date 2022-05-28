/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { TypedServiceBroker } from './typed.broker';
import { ContextMeta } from '@my-app/authz-api';
{{#if needDb}}
import { MoleculerMikroContext as MCTX } from 'moleculer-context-db';
{{/if}}
{{#unless needDb}}
import { Context as MCTX } from 'moleculer';
{{/unless}}

import { brokerConfig } from './broker.config';
import { ServiceActions, ServiceEvents, ServiceName } from '../../service.types';
import { Override } from '../type.utils';

export const broker: TypedServiceBroker<
  ServiceActions,
  ServiceEvents,
  ServiceName,
  ContextMeta
> = new TypedServiceBroker(brokerConfig);

export type CTX<P = unknown, M extends ContextMeta = ContextMeta> = Override<
  MCTX<P, M>,
  {
    broker: typeof broker;
  }
>;
