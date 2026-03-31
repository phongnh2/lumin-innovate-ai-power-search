###########################
#     Dev dependencies    #
###########################
FROM node:22.15.0-alpine3.20 AS dependencies
WORKDIR /usr/src/app
RUN apk update && apk add git python3 g++ make && rm -rf /var/cache/apk/*
COPY package.json package-lock.json ./
RUN npm install

###########################
# Production dependencies #
###########################
FROM node:22.15.0-alpine3.20 AS production_dependencies
WORKDIR /usr/src/app
RUN apk update && apk add git python3 g++ make && rm -rf /var/cache/apk/*
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install --production && npm cache clean --force
# Command to list all large modules.
# RUN du -sh ./node_modules/* | sort -nr | grep '\dM.*'
# Remove some heavy files
RUN rm -rf node_modules/rxjs/src/ \
  node_modules/rxjs/bundles/ \
  node_modules/rxjs/_esm5/ \
  node_modules/rxjs/_esm2015/ \
  node_modules/aws-sdk/dist/

# Remove git after installation to reduce image size
RUN apk del git

###########################
#          Build          #
###########################
FROM dependencies AS build
COPY . .
RUN npm run build:dependencies && npm run build:graphql
RUN npm run build

###########################
#        Production       #
###########################
FROM node:22.15.0-alpine3.20 AS production
WORKDIR /usr/src/app
EXPOSE 4200 4000 4040
USER node
ARG VERSION

COPY --chown=node:node --from=production_dependencies /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/lumin-proto ./lumin-proto
COPY --chown=node:node --from=build /usr/src/app/src ./src
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

ENV LUMIN_VERSION=$VERSION

CMD [ "node", "dist/main.js" ]
