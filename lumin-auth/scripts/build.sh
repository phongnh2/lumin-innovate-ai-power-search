#!/bin/bash
set -euox pipefail
git submodule init
git submodule update --recursive

docker build \
	--build-arg NEXT_PUBLIC_VERSION=$TAG \
	--build-arg NEXT_PUBLIC_ENVIRONMENT_NAME \
	--build-arg NEXT_PUBLIC_DROPBOX_PROVIDER_ID \
	--build-arg NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY \
	--build-arg NEXT_PUBLIC_DATADOG_CLIENT_TOKEN \
	--build-arg NEXT_PUBLIC_OIDC_GOOGLE_CLIENT_ID \
	--build-arg NEXT_PUBLIC_POOL_ID \
	--build-arg NEXT_PUBLIC_PINPOINT_APP_ID \
	--build-arg SSH_PRIVATE_KEY \
	-t $PROJECT_NAME:$TAG -f Dockerfile .

