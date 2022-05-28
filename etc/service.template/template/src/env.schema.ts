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
{{#if needDb}}
import { MikroORMOptions } from '@mikro-orm/core';
{{/if}}
import { EnvBase } from './lib/env.base.schema';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, prettier/prettier
const optional = /* istanbul ignore next */ () => jf.string().optional().empty('');
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, prettier/prettier
const required = /* istanbul ignore next */ () => jf.string().required();
{{#if needDb}}
const optionalBoolean = () => jf.boolean().optional().empty('');
{{/if}}

// Decorate properties using joiful validator
export class Env extends EnvBase {
  {{#if needDb}}
  // ---------------------------------------------------------------
  //  Mikro-orm db connector
  @(optional()
    .default({{#if sql}}'sqlite'{{/if}}{{#if mongo}}'mongo'{{/if}})
    .valid('mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite'))
  DB_CORE__TYPE!: MikroORMOptions['type'];

  @(optional().default({{#if sql}}':memory:'{{/if}}{{#if mongo}}'{{serviceName}}db'{{/if}}))
  DB_CORE__DB_NAME!: string;

  @optional()
  DB_CORE__NAME?: string;

  {{#if sql}}
  @optional()
  {{/if}}
  {{#if mongo}}
  @required()
  {{/if}}
  DB_CORE__CLIENT_URL?: string;

  @optional()
  DB_CORE__USER?: string;

  @optional()
  DB_CORE__PASSWORD?: string;

  @(optionalBoolean().default(false))
  DB_CORE__DEBUG?: boolean;

  // Any custom extensions of the base environemntal schema here
  {{/if}}
  {{#unless needDb}}
  // Any custom extensions of the base environemntal schema here
  @optional()
  EXAMPLE_ENV_VAR?: string;
  {{/unless}}
}
