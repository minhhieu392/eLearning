#!/bin/bash

set -euo pipefail

# Required 1 arguments before continues
if [[ $# -lt 1 ]]; then
  echo "Required exactly 1 arguments: BUILD_NUMBER. Exit."
  exit 2
fi

BUILD_NUMBER=$1
BUILD_TAG=${2:-dev} #It should be dev, staging or prod. Default to dev.

DOCKER_IMAGE=docker.vgasoft.vn/elearning-api-"$BUILD_TAG":"$BUILD_NUMBER"
ENV_FILE=/data/env/apielearning/.env.production # Default to dev environment
CONTAINER_NAME=elearning-api-"$BUILD_TAG"

if [ "$BUILD_TAG" = "main" ]; then
  ENV_FILE=/data/env/apielearning/.env.production # Production environment file
elif [ "$BUILD_TAG" = "test" ]; then
  ENV_FILE=/data/env/apielearning/.env.production # Staging environment file
fi

PORT=$(awk 'sub(/^[ \t]*WEB_PORT=/,""){print $1}' $ENV_FILE)
if [ -z "$PORT" ]; then
  echo "Cannot get WEB_PORT from $ENV_FILE. Exit."
  exit 1
fi
echo "Exposed port: $PORT"
#SOCKET_PORT=$(awk 'sub(/^[ \t]*SOCKET_PORT=/,""){print $1}' $ENV_FILE)
#if [ -z "$SOCKET_PORT" ]; then
#  echo "Cannot get SOCKET_PORT from $ENV_FILE. Exit."
#  exit 1
#fi
#echo "Exposed SOCKET_PORT: $SOCKET_PORT"

containerId=$(docker ps -qa --filter "name=$CONTAINER_NAME")
if [ -n "$containerId" ]; then
  echo "Stop and remove existing container..."
  docker stop "$CONTAINER_NAME" | xargs docker rm
fi

docker run -d --init --name "$CONTAINER_NAME" \
  --mount type=bind,source="$ENV_FILE",target=/usr/src/app/.env.production \
  --restart always \
  -p "$PORT":"$PORT" \
  "$DOCKER_IMAGE" npm run start
