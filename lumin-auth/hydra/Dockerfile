FROM docker.io/oryd/hydra:v2.0.3

USER root

RUN apk add gettext

COPY ./hydra/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./hydra /etc/config/hydra

RUN touch /etc/config/hydra/hydra.yml && chown ory:ory /etc/config/hydra/hydra.yml

USER ory

ENTRYPOINT [ "/entrypoint.sh" ]

CMD ["serve"]
