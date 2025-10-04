FROM alpine:3.18
RUN apk add --no-cache mariadb-client bash

WORKDIR /app
COPY tools/migrate.sh /usr/local/bin/migrate.sh
RUN chmod +x /usr/local/bin/migrate.sh

# Migrations should be provided at runtime via a bind mount to /migrations
# (keeps development fast; no image rebuild required for new migrations)
RUN mkdir -p /migrations

ENTRYPOINT ["/usr/local/bin/migrate.sh"]
