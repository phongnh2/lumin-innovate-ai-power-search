#!/bin/bash
set -euox pipefail

export CYPRESS_INSTALL_BINARY=0

corepack enable

pnpm install
git fetch origin $BITBUCKET_PR_DESTINATION_BRANCH:refs/remotes/origin/$BITBUCKET_PR_DESTINATION_BRANCH
npm_config_branch=$BITBUCKET_PR_DESTINATION_BRANCH pnpm run eslint-build
npm_config_branch=$BITBUCKET_PR_DESTINATION_BRANCH pnpm run stylelint-build
