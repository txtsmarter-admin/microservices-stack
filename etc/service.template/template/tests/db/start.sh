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

DB_AVAILABLE=false

if NODE_ENV=${NODE_ENV} ./is.db.running.sh; then
  DB_AVAILABLE=true
fi

if [ "$DB_AVAILABLE" = false ]; then
  echo "Db not available. Start and wait for db to be up"

  PORT=${DB_PORT} NODE_ENV=${NODE_ENV} docker-compose -p {{serviceName}}-data-${NODE_ENV} up -d {{serviceName}}-db

  COUNT=0

  until docker exec -t {{serviceName}}-db-${NODE_ENV} psql -h "localhost" -U ${DB_CORE__USER} -c '\q'; do
    >&2 echo "Waiting for Postgres db start"
    sleep 1
    if [ "$COUNT" -gt 120 ]; then
      echo "Timeout while waiting for database"
      exit 1
    fi
    let COUNT=$COUNT+1
  done
else
  echo "Db available"
fi


