#!/bin/bash
set -e

cd "$(dirname "$0")"

source ../../common.env

USER=${PG_DB__USER} PASS=${PG_DB__PASS} PG_DATABASES=${PG_DATABASES} PORT=${PG_DB__PORT} docker-compose -p pg-db-2.0 down
