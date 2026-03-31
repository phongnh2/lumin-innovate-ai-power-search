#!/bin/bash
set -euox pipefail

export TAG="$BITBUCKET_BRANCH-$BITBUCKET_BUILD_NUMBER"
git submodule init
git submodule update --recursive

docker build --build-arg VERSION=$TAG -t $PROJECT_NAME:$TAG -f Dockerfile .