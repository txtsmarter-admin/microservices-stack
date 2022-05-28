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
import { MikroORMOptions } from '@mikro-orm/core';
import { EnvBase } from './lib/env.base.schema';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, prettier/prettier
const optional = /* istanbul ignore next */ () =>
  jf.string().optional().empty('');
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, prettier/prettier
const required = /* istanbul ignore next */ () => jf.string().required();
const optionalBoolean = () => jf.boolean().optional().empty('');

// Decorate properties using joiful validator
export class Env extends EnvBase {
  // ---------------------------------------------------------------
  //  Mikro-orm db connector
  @optional()
    .default('sqlite')
    .valid('mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite')
  DB_CORE__TYPE!: MikroORMOptions['type'];

  @optional().default(':memory:')
  DB_CORE__DB_NAME!: string;

  @optional()
  DB_CORE__NAME?: string;

  @optional()
  DB_CORE__CLIENT_URL?: string;

  @optional()
  DB_CORE__USER?: string;

  @optional()
  DB_CORE__PASSWORD?: string;

  @optionalBoolean().default(false)
  DB_CORE__DEBUG?: boolean;

  // Any custom extensions of the base environemntal schema here
}
