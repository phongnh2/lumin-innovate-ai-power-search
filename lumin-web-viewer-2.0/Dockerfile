FROM node:22.15.0-alpine3.20 AS os-deps
WORKDIR /usr/src/app
RUN apk add coreutils curl g++ git make openssh py3-setuptools python3 \
    && apk update && apk upgrade curl

# uncomment for local development
# RUN apk add --no-cache python3 python3-dev py3-pip
# RUN apk add --no-cache g++ make
# end

ARG SSH_PRIVATE_KEY
RUN mkdir -p ~/.ssh/ \
  && chmod 700 ~/.ssh \
  && touch ~/.ssh/known_hosts \
  && (umask  077 ; echo "$SSH_PRIVATE_KEY" | tr -d '\r' | base64 --decode > ~/.ssh/id_rsa) \
  && ssh-keyscan -T 60 bitbucket.org >> ~/.ssh/known_hosts \
  && ssh-keyscan -T 60 github.com >> ~/.ssh/known_hosts \
  && eval "$(ssh-agent -s)" \
  && ssh-add ~/.ssh/id_rsa

RUN npm install -g pnpm@10.12.1
RUN corepack enable
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# build environment
FROM os-deps AS builder
ARG LUMIN_GOOGLE_PICKER_DEVELOPERKEY
ARG LUMIN_DATADOG_CLIENT_TOKEN
ARG LUMIN_PDFTRON_LICENSE_KEY
ARG LUMIN_STRIPE_PUBLIC_KEY
ARG LUMIN_VERSION
ARG LUMIN_BRANCH
ARG LUMIN_ROBOT_PATH
ARG LUMIN_PUBLIC_RECAPTCHA_V3_SITE_KEY
ARG DATADOG_API_KEY
ARG LUMIN_BRANCH_IO_KEY
ARG LUMIN_BRAZE_API_KEY
ARG LUMIN_GROWTHBOOK_CLIENT_KEY
ARG LUMIN_STRIPE_PLATFORM_PUBLIC_KEY
ARG LUMIN_PUBLIC_KEY_VERIFY_SIGNED_RESPONSE
ARG LUMIN_LOGO_DEV_API_KEY

COPY .npmrc package*.json pnpm-*.yaml ./
# uncomment for local development
# RUN npm cache clean --force
# end
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm install --frozen-lockfile
ADD $LUMIN_ROBOT_PATH ./robots.txt
COPY . .
RUN pnpm run build

# Comment RUN datadog-ci instruction for testing in development.
RUN datadog-ci sourcemaps upload ./build \
  --service=lumin-web-viewer \
  --release-version="$LUMIN_VERSION" \
  --minified-path-prefix=/
# end

# production environment
FROM nginxinc/nginx-unprivileged:1.28.0-alpine3.21 AS production
ARG LUMIN_BRANCH
ARG DISABLE_SOURCE_MAP
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/sourcemap.conf /etc/nginx/includes/
COPY scripts/prohibit-sourcemap.sh /tmp
RUN tmp/prohibit-sourcemap.sh
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
EXPOSE 8080
USER nginx
CMD ["nginx", "-g", "daemon off;"]
