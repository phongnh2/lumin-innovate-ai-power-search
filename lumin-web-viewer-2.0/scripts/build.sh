#!/bin/bash
set -euox pipefail

export TAG="$BITBUCKET_BRANCH-$BITBUCKET_BUILD_NUMBER"
git submodule init
git submodule update --recursive
git submodule status

LUMIN_ROBOT_PATH=./robots.staging.txt

if [ $BITBUCKET_BRANCH == "production" ]; then
  LUMIN_ROBOT_PATH=./robots.txt
fi

docker build \
--build-arg LUMIN_GOOGLE_PICKER_DEVELOPERKEY \
--build-arg LUMIN_DATADOG_CLIENT_TOKEN \
--build-arg LUMIN_PDFTRON_LICENSE_KEY \
--build-arg LUMIN_STRIPE_PUBLIC_KEY \
--build-arg LUMIN_STRIPE_PLATFORM_PUBLIC_KEY \
--build-arg LUMIN_PUBLIC_RECAPTCHA_V3_SITE_KEY \
--build-arg LUMIN_BRANCH_IO_KEY \
--build-arg LUMIN_BRAZE_API_KEY \
--build-arg DISABLE_SOURCE_MAP \
--build-arg DATADOG_API_KEY \
--build-arg LUMIN_GROWTHBOOK_CLIENT_KEY \
--build-arg LUMIN_VERSION=$TAG \
--build-arg LUMIN_BRANCH=$BITBUCKET_BRANCH \
--build-arg LUMIN_ROBOT_PATH=$LUMIN_ROBOT_PATH \
--build-arg SSH_PRIVATE_KEY \
--build-arg LUMIN_PUBLIC_KEY_VERIFY_SIGNED_RESPONSE \
--build-arg LUMIN_LOGO_DEV_API_KEY \
-t $PROJECT_NAME:$TAG -f Dockerfile .
