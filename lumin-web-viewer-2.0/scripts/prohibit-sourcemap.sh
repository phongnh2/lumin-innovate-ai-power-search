#!/bin/sh

# This script will be ran in the build container process.
# We remove the sourcemap.conf file if we are building the development branches.
if [[ "$LUMIN_BRANCH" != "production" && "$DISABLE_SOURCE_MAP" != "true" ]]; then
  echo "*** Enabling source map to serve sourcemap files."
  rm -f /etc/nginx/includes/sourcemap.conf
  touch /etc/nginx/includes/sourcemap.conf
fi
