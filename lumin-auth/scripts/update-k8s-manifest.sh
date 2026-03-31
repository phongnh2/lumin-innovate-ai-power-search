#!/bin/bash
set -euox pipefail

# Clone repository
cd $HOME
git clone $K8S_REPOSITORY

cd "$HOME/$K8S_PROJECT_NAME/$PROJECT_NAME/overlays/$NEXT_PUBLIC_ENVIRONMENT_NAME"
export PATH="$PATH:/usr/local/kustomize"
kustomize edit set image "$CONTAINER_REGISTRY/$PROJECT_NAME:$TAG"
git config --global user.email "bitbucket@luminpdf.com"
git config --global user.name "Bitbucket"
git add .
git commit -m "Update $PROJECT_NAME image tag $TAG"
git push
