#!/bin/bash
set -euox pipefail

# Set the maximum heap size for Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
export CYPRESS_INSTALL_BINARY=0

corepack enable

git submodule init
git submodule update --remote --recursive
pnpm install
# npm audit --audit-level=critical
mkdir -p badges
pnpm run test-jest:badges
pnpm run test-jest:check-test-coverage
