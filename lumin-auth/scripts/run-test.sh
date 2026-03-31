#!/bin/bash
set -euox pipefail

# Set the maximum heap size for Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

yarn|| (yarn cache clean && yarn)

# Run security audit - only fail on high or critical vulnerabilities
# Temporarily disable exit-on-error to capture the actual exit code
set +e
yarn audit --level critical
audit_exit_code=$?
set -e

if [ $audit_exit_code -ge 16 ]; then
  echo "High or critical vulnerabilities found!"
  exit 1
fi

mkdir -p badges
yarn test-jest:badges
