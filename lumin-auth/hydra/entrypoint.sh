#!/bin/sh

cat /etc/config/hydra/hydra_template.yml | envsubst > /etc/config/hydra/hydra.yml

exec hydra "$@"