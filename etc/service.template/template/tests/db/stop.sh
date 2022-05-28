#!/usr/bin/env bash

set -e

if [ -z ${ENV_FILE} ]; then
  echo "ENV_FILE value is not set!"
  exit 1
fi

source ${ENV_FILE}

# check for DB port setting
if [[ -z ${DB_CORE__PORT} && -z ${DB_CORE__CLIENT_URL} ]]; then
  echo "Neither DB_CORE__PORT nor DB_CORE__CLIENT_URL is set!"
  exit 1
fi

if [ -z ${DB_CORE__PORT} ]; then
  DB_PORT=$(echo ${DB_CORE__CLIENT_URL} | awk -F: '{print $3}')
  if [ -z ${DB_PORT} ]; then
    DB_PORT=5432
  fi
else
  DB_PORT=${DB_CORE__PORT}
fi

cd "$(dirname "$0")"

PORT=${DB_PORT} NODE_ENV=${NODE_ENV} docker-compose -p {{serviceName}}-data-${NODE_ENV} down -v
