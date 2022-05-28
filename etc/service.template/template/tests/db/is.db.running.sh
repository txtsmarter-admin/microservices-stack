#!/bin/bash

if ! docker exec -t {{serviceName}}-db-${NODE_ENV} psql -h "localhost" -U "{{serviceName}}" -c '\q'; then
  echo "Db not available."
  exit 1
else
  echo "Db available."
fi