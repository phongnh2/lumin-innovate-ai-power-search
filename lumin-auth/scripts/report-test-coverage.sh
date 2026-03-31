#!/bin/bash
set -euox pipefail

# Set the maximum heap size for Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

yarn || (yarn cache clean && yarn)

mkdir -p badges
yarn test-jest:badges
yarn test-jest:check-test-coverage