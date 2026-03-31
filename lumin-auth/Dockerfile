ARG NODEJS_VERSION="22.15.0-alpine3.20"
# Install dependencies only when needed
FROM node:${NODEJS_VERSION} AS deps

WORKDIR /opt/app
RUN apk add git openssh coreutils curl python3 make g++ py3-setuptools

ARG SSH_PRIVATE_KEY
RUN mkdir -p ~/.ssh/ \
  && chmod 700 ~/.ssh \
  && touch ~/.ssh/known_hosts \
  && (umask  077 ; echo $SSH_PRIVATE_KEY | tr -d '\r' | base64 --decode > ~/.ssh/id_rsa) \
  && ssh-keyscan -T 60 bitbucket.org >> ~/.ssh/known_hosts \
  && ssh-keyscan -T 60 github.com >> ~/.ssh/known_hosts \
  && eval "$(ssh-agent -s)" \
  && ssh-add ~/.ssh/id_rsa

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile || (yarn cache clean && yarn install --frozen-lockfile)

# Rebuild the source code only when needed
# This is where because may be the case that you would try
# to build the app based on some `X_TAG` in my case (Git commit hash)
# but the code hasn't changed.
FROM node:${NODEJS_VERSION} AS builder
WORKDIR /opt/app
ENV NODE_ENV=production
RUN apk add bash

ARG NEXT_PUBLIC_DROPBOX_PROVIDER_ID
ARG NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
ARG NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY
ARG NEXT_PUBLIC_OIDC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_ENVIRONMENT_NAME
ARG NEXT_PUBLIC_POOL_ID
ARG NEXT_PUBLIC_PINPOINT_APP_ID
ARG NEXT_PUBLIC_VERSION

COPY --from=deps /opt/app/node_modules ./node_modules
COPY lumin-proto ./lumin-proto
COPY package.json yarn.lock protoc.sh ./
RUN yarn proto:gen-types

COPY . .
RUN yarn build

# Production image, copy all the files and run next
FROM node:${NODEJS_VERSION} AS runner
WORKDIR /opt/app
ENV NODE_ENV=production
ARG X_TAG
USER node

COPY --chown=node:node --from=builder /opt/app/next.config.js ./
COPY --chown=node:node --from=builder /opt/app/public ./public
COPY --chown=node:node --from=builder /opt/app/lumin-proto ./lumin-proto
COPY --chown=node:node --from=builder /opt/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /opt/app/configs/environment-loader/ ./configs/environment-loader
COPY --chown=node:node --from=builder /opt/app/.next ./.next
COPY --chown=node:node --from=builder /opt/app/next-i18next.config.js ./next-i18next.config.js

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]

