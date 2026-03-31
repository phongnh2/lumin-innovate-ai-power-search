#!/bin/bash
set -euox pipefail

git submodule init
git submodule update --remote --recursive
npm install

git fetch origin $BITBUCKET_PR_DESTINATION_BRANCH:refs/remotes/origin/$BITBUCKET_PR_DESTINATION_BRANCH
npm run eslint-build --branch=$BITBUCKET_PR_DESTINATION_BRANCH