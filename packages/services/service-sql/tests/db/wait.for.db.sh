#!/usr/bin/env bash

COUNT=0

until psql -h "localhost" -U "service-sql" -c '\q'; do
  >&2 echo "Waiting for Postgres db start"
  sleep 1
  if [ "$COUNT" -gt 120 ]; then
    echo "Timeout while waiting for database"
    exit 1
  fi
  let COUNT=$COUNT+1
done