#!/bin/bash
set -euox pipefail

# Clone repository
cd $HOME
git clone $K8S_REPOSITORY

branch_name=$BITBUCKET_BRANCH
if [ $branch_name == 'master' ]; then
  branch_name='staging'
fi
cd "$HOME/$K8S_PROJECT_NAME/$PROJECT_NAME/overlays/$branch_name"
export PATH="$PATH:/usr/local/kustomize"
export TAG="$branch_name-$BITBUCKET_BUILD_NUMBER"
kustomize edit set image "$CONTAINER_REGISTRY/$PROJECT_NAME:$TAG"
git config --global user.email "bitbucket@luminpdf.com"
git config --global user.name "Bitbucket"
git add .
git commit -m "Update $PROJECT_NAME image tag $TAG"
git pull --rebase
git push
