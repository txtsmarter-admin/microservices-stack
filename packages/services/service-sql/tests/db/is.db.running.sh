#!/bin/bash

if ! docker exec -t service-sql-db-${NODE_ENV} psql -h "localhost" -U "service-sql" -c '\q'; then
  echo "Db not available."
  exit 1
else
  echo "Db available."
fi