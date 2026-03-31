#!/bin/bash
set -euox pipefail

CONTAINER_REGISTRY=781329457629.dkr.ecr.us-east-1.amazonaws.com
CONTAINER_IMAGE=$CONTAINER_REGISTRY/lumin-kratos
IMAGE_TAG=$(git branch --show-current)-$(git rev-parse --short HEAD)

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $CONTAINER_REGISTRY

docker buildx build --platform=linux/amd64 -t lumin-kratos -f ./kratos/Dockerfile ./kratos

docker tag lumin-kratos $CONTAINER_IMAGE:latest
docker tag lumin-kratos $CONTAINER_IMAGE:$IMAGE_TAG
docker push --all-tags $CONTAINER_IMAGE

# cd "$HOME/$K8S_PROJECT_NAME/$PROJECT_NAME/overlays/$BITBUCKET_BRANCH"
# kustomize edit set image $CONTAINER_IMAGE:$IMAGE_TAG
# git config --global user.email "bitbucket@luminpdf.com"
# git config --global user.name "Bitbucket"
# git add .
# git commit -m "Update lumin-kratos image tag $IMAGE_TAG"
# git push