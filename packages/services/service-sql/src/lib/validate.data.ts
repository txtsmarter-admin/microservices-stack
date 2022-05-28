/* istanbul ignore file */

/**
 * Validators for context params and event payloads.
 * Custom validation of moleculer@0.0.14 is not working.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

import * as jf from 'joiful';
import { Errors } from 'moleculer';

import { CTX } from './moleculer/broker';
import { config } from './env';

const { MoleculerError } = Errors;

let abortEarly = false;
if (config.NODE_ENV === 'production') {
  abortEarly = true;
}

export function validateParams<TParams>(
  ctx: CTX<TParams | TParams[]>,
  Class: new () => TParams
): void {
  const { params } = ctx;
  let error;
  let value;

  if (Array.isArray(params)) {
    ({ error, value } = jf.validateArrayAsClass(params, Class, {
      abortEarly
    }));
  } else {
    ({ error, value } = jf.validateAsClass(params, Class, {
      abortEarly
    }));
  }

  if (error) {
    throw new MoleculerError(
      `Invalid params provided. ${error.message}`,
      400,
      'BAD_REQUEST',
      params
    );
  }

  // Need to reassign to params because defaults set by joiful
  ctx.params = value;
}

export function validateResponse<TResponse>(
  response: TResponse | TResponse[],
  Class: new () => TResponse
): void {
  let error;
  let value;

  if (Array.isArray(response)) {
    ({ error, value } = jf.validateArrayAsClass(response, Class, {
      abortEarly
    }));
  } else {
    ({ error, value } = jf.validateAsClass(response, Class, {
      abortEarly
    }));
  }

  if (error) {
    throw new MoleculerError(
      `Invalid response generated. ${error.message}`,
      500,
      'INTERNAL_SERVER_ERROR',
      response
    );
  }

  // Need to reassign to response because of defaults set by joiful
  Object.assign(response, value);
}

export function validatePayload<T>(payload: T[], Class: new () => T): T[];
export function validatePayload<T>(payload: T, Class: new () => T): T;
export function validatePayload<T>(
  payload: T | T[],
  Class: new () => T
): T | T[] {
  let error;
  let value;

  if (Array.isArray(payload)) {
    ({ error, value } = jf.validateArrayAsClass(payload, Class, {
      abortEarly
    }));
  } else {
    ({ error, value } = jf.validateAsClass(payload, Class, {
      abortEarly
    }));
  }

  if (error) {
    throw new MoleculerError(
      `Invalid event payload received. ${error.message}`,
      500,
      'INTERNAL_SERVER_ERROR',
      payload
    );
  }

  return value;
}
