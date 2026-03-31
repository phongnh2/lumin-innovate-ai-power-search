#!/bin/bash
# Created on Thu Feb 16 2023 by hieudm@dgroup.co
set -e
# Color definitions
GREEN='\033[1;32m'
PURPLE='\033[0;35m'
NC='\033[0m'

PROTO_DESTINATION_PATH="./proto"

echo -e "${PURPLE}[+] Cleanup old proto${NC}"
rm -rf "${PROTO_DESTINATION_PATH}"

echo -e "${PURPLE}[+] Generate protobuf from proto${NC}"
for f in ./lumin-proto/*; do
  # mount the path from lumin-proto/* => src/proto/*
  proto_path=$(echo "$f" | sed 's/\.\/lumin-proto\/\(.*\)/\1/')
  proto_dest="${PROTO_DESTINATION_PATH}/${proto_path}"

  # Define paths to exclude
  exclude_paths=("ai" "integration" "organization")

  # Skip excluded paths
  if [[ " ${exclude_paths[@]} " =~ " ${proto_path} " ]]; then
    echo -e "${PURPLE}[!] Skipping 'lumin-proto/${proto_path}'${NC}"
    continue
  fi

  mkdir -p "${proto_dest}"

  # generate type definitions (must use @grpc/proto-loader — bare `npx proto-loader-gen-types` hits a registry placeholder package)
  npx --yes --package=@grpc/proto-loader proto-loader-gen-types --longs=String --enums=String --defaults --grpcLib=@grpc/grpc-js --outDir="${proto_dest}" --outputTemplate=%sOutput "${f}"/*.proto

  echo -e "${GREEN}\t\xE2\x9C\x94 Generating '${proto_path}' protobuf${NC}"
done

proto_dest="${PROTO_DESTINATION_PATH}/organization"
mkdir -p "${proto_dest}"
npx --yes --package=@grpc/proto-loader proto-loader-gen-types -k --includeDirs ./lumin-proto --longs=String --enums=String --defaults --grpcLib=@grpc/grpc-js --outDir="${proto_dest}" --outputTemplate=%sOutput "./organization/organization.proto"

echo -e "${PURPLE}[+] Proto generated${NC}"
