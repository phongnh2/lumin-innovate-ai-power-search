# Lumin auth

![Coverage line](https://bitbucket.org/nitrolabs/lumin-auth/downloads/badge-lines.svg)
![Coverage branches](https://bitbucket.org/nitrolabs/lumin-auth/downloads/badge-branches.svg)
![Coverage functions](https://bitbucket.org/nitrolabs/lumin-auth/downloads/badge-functions.svg)
![Coverage statements](https://bitbucket.org/nitrolabs/lumin-auth/downloads/badge-statements.svg)

## Prerequisite
```sh
# It will use .nvmrc to install and use specific project node version.
nvm use

# Yarn install
npm install -g yarn

# Take a look our setup at Confluence
https://lumin.atlassian.net/wiki/spaces/LP/pages/1322451008/Lumin+Ory+development+setup
```

## Getting Started

First, run the development server:

```sh
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Application environment variable

1. Create `.env` at root to set the env when developing
2. Look at .env.sample to know all environment variables needed.

## Generate kratos courier template

```sh
yarn compile-courier-templates
```

## VSCode
