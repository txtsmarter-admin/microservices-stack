/**
 * Validation schema for env vars.
 * EnvBase is base class for config.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import * as jf from 'joiful';

const optional = () => jf.string().optional().empty('');
const required = () => jf.string().required();

export class EnvBase {
  @required().valid('development', 'production', 'staging', 'test')
  NODE_ENV!: 'development' | 'production' | 'staging' | 'test';

  // ---------------------------------------------------------------
  //  Moleculer broker options
  @optional()
    .default('info')
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
  LOG_LEVEL!: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

  @optional().default('default').valid('default', 'simple', 'short')
  LOG_FORMATTER!: 'default' | 'simple' | 'short';

  @optional().default('unknown')
  HOSTNAME?: string;

  @optional()
  LOG_HOST?: string;

  @optional().pattern(/\d+/)
  LOG_PORT?: string;

  @optional()
  MESSAGE_BROKER_HOST?: string;

  @optional().pattern(/\d+/)
  MESSAGE_BROKER_PORT?: string;

  @optional()
  CACHE_CONNECTION_STRING?: string;

  // ---------------------------------------------------------------
  //  Tests
  @optional().pattern(/\d+/)
  JEST_TIMEOUT?: string;
}
