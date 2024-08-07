FROM mariadb:latest

ENV MARIADB_ALLOW_EMPTY_ROOT_PASSWORD=1

# Set the timezone for mariadb to Europe/Berlin
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
