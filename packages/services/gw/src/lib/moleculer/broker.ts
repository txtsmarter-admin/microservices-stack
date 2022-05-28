/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import { TypedServiceBroker } from './typed.broker';
import { ContextMeta } from '@my-app/authz-api';
import { Context as MCTX } from 'moleculer';

import { brokerConfig } from './broker.config';
import {
  ServiceActions,
  ServiceEvents,
  ServiceName
} from '../../service.types';
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
