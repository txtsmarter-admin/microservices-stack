/* istanbul ignore file */

/**
 * Typed config loader.
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import dotenv from 'dotenv';
import path from 'path';
import pkgDir from 'pkg-dir';
import * as jf from 'joiful';
import { Env } from '../env.schema';

// ---------------- Determine env vars path ----------------------

let { ENV_FILE = '' } = process.env;

if (ENV_FILE && !path.isAbsolute(ENV_FILE)) {
  const ROOT_DIR = pkgDir.sync(__dirname);
  if (!ROOT_DIR) {
    throw new Error(
      `Unable to determine project root directory. It is required to load config properly. ` +
        `Hint: if you are not able to fix this problem then provide ENV_FILE=<absolute-path>`
    );
  }
  ENV_FILE = path.join(ROOT_DIR, ENV_FILE);
}

// ---------------- Load & parse ----------------------
if (ENV_FILE) {
  const { error: parseErr } = dotenv.config({
    path: ENV_FILE
  });

  if (parseErr) {
    throw new Error(
      `Unable to parse .env file pointed by env var ENV_FILE="${ENV_FILE}". ${parseErr}`
    );
  }
}

// ---------------- Validation ----------------------

const { error: validationErr, value } = jf.validateAsClass(process.env, Env, {
  allowUnknown: true
});

if (validationErr) {
  throw new Error(`Config validation error. ${validationErr}`);
}

export const config: Env = value as any;
