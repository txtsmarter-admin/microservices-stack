#!/bin/bash
set -e

cd "$(dirname "$0")"

source ../common.env

PORT=${RBMQ_BROKER__PORT} docker-compose -p rbmq_broker up -d