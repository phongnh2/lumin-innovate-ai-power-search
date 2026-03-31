include .env

commit_hash := $(shell git rev-parse --short HEAD)
$(eval export $(shell sed -ne 's/ *#.*$$//; /./ s/=.*$$// p' .env))
export NODE_ENV := $(environment)
export LUMIN_NODE_ENV := $(environment)
export LUMIN_BRANCH := $(environment)
export LUMIN_VERSION := $(environment)-$(commit_hash)
export LUMIN_ROBOT_PATH := robots.txt

load-env:
	echo "\033[1;32m✅ Export environment variables for '$(environment)' environment \033[0m"
	if [ -z "$(environment)" ]; then echo "\033[1;31m❌ 'environment' variable is empty!\033[0m"; exit 1; fi
	printenv

build: load-env
	echo "\033[1;32m✅ Build docker image \033[0m"
	docker buildx build \
	--platform linux/arm64 \
	--build-arg LUMIN_DROPBOX_CLIENT_ID \
	--build-arg LUMIN_EMAILJS_SERVICE \
	--build-arg LUMIN_EMAILJS_USER_ID \
	--build-arg LUMIN_GOOGLE_PICKER_APP_ID \
	--build-arg LUMIN_GOOGLE_PICKER_CLIENTID \
	--build-arg LUMIN_GOOGLE_PICKER_DEVELOPERKEY \
	--build-arg LUMIN_INTERCOM_APP_ID \
	--build-arg LUMIN_DATADOG_CLIENT_TOKEN \
	--build-arg LUMIN_PAYMENT_SECRET_KEY \
	--build-arg LUMIN_PDFTRON_LICENSE_KEY \
	--build-arg LUMIN_SENTRY_DSN \
	--build-arg LUMIN_STRIPE_PUBLIC_KEY \
	--build-arg LUMIN_STRIPE_PLATFORM_PUBLIC_KEY \
	--build-arg LUMIN_VERSION \
	--build-arg LUMIN_BRANCH \
	--build-arg LUMIN_POOL_ID \
	--build-arg LUMIN_PINPOINT_APP_ID \
	--build-arg LUMIN_INTERNAL_VIEWER_PERFORMANCE_TEST_TOKEN \
	--build-arg LUMIN_ROBOT_PATH \
	--build-arg LUMIN_PUBLIC_RECAPTCHA_SITE_KEY \
	--build-arg LUMIN_HUBSPOT_ID \
	--build-arg LUMIN_GA4_ID \
	--build-arg LUMIN_UNIVERSAL_LINK \
	--build-arg LUMIN_PUBLIC_RECAPTCHA_V3_SITE_KEY \
	--build-arg LUMIN_APPLE_CLIENT_ID \
	--build-arg LUMIN_ENABLE_NEW_AUTHEN_DATE \
	--build-arg LUMIN_TAG_MANAGER_ID \
	--build-arg LUMIN_SIGN_APP_URL \
	--build-arg DATADOG_API_KEY \
	--build-arg DISABLE_SOURCE_MAP \
	--build-arg SSH_PRIVATE_KEY \
	--build-arg LUMIN_PUBLIC_KEY_VERIFY_SIGNED_RESPONSE \
	--build-arg LUMIN_LOGO_DEV_API_KEY \
	-t lumin-web-viewer:$(LUMIN_VERSION) --progress plain -f Dockerfile .

start: build
	echo "\033[1;32m✅ Run docker container from image 'lumin-web-viewer:$(LUMIN_VERSION)' \033[0m "
	docker run -p 3000:80 lumin-web-viewer:$(LUMIN_VERSION)
