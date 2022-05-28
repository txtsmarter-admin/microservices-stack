/**
 * ! Do not rename or move file.
 * ! Do not rename Env class.
 *
 * Environment variables will be validated basing on this file.
 * Example in EnvBase class.
 * Env is type for { config } from ./lib
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import * as jf from 'joiful';
import { EnvBase } from './lib/env.base.schema';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, prettier/prettier
const optional = /* istanbul ignore next */ () =>
  jf.string().optional().empty('');
const optionalNumber = () => jf.number().optional().empty('');
const optionalBoolean = () => jf.boolean().optional().empty('');

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, prettier/prettier
const required = /* istanbul ignore next */ () => jf.string().required();

// Decorate properties using joiful validator
export class Env extends EnvBase {
  @optionalBoolean().default(true)
  AUTH__GRAPHQL_ENABLE!: boolean;

  // TODO such secret should not have default
  @optional().default('MYAPP-JWT-KEY')
  AUTH__JWT_KEY!: string;

  // my-app ttl
  @optional()
    .default('7 days')
    .pattern(/\d+ \w+/)
  AUTH__EXPIRES_IN!: string;

  // GraphQL port
  @optionalNumber().integer().positive().default(4000)
  GRAPHQL__SERVER_PORT!: number;

  @optionalBoolean().default(false)
  GRAPHQL__PLAYGROUND!: boolean;

  // Apollo Studio
  @optional()
  APOLLO_KEY!: string;

  @optional()
  APOLLO_GRAPH_REF!: string;

  @optionalBoolean().default(true)
  APOLLO_SCHEMA_REPORTING!: boolean;
}
