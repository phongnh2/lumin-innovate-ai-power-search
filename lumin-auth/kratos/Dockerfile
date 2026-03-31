FROM docker.io/oryd/kratos:v25.4.0

USER root

RUN apk add gettext

COPY ./kratos/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./kratos /etc/config/kratos

RUN touch /etc/config/kratos/kratos.yml && chown ory:ory /etc/config/kratos/kratos.yml

USER 10000

ENTRYPOINT [ "/entrypoint.sh" ]

CMD ["serve"]
