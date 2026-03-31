#!/bin/bash
set -euox pipefail

git submodule init
git submodule update --remote --recursive
npm install

npm rebuild bcrypt --update-binary
npm audit --audit-level=critical
mkdir -p badges
npm run test:badges
npm run test:coverage:report
