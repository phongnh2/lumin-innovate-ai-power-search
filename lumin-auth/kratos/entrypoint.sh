#!/bin/sh

# Will load all env to `kratos.yml` at runtime
cat /etc/config/kratos/kratos_template.yml | envsubst > /etc/config/kratos/kratos.yml

# Will exec the CMD from your Dockerfile
exec kratos "$@"