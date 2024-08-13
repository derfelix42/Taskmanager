FROM mariadb:latest

# Set the timezone for mariadb to Europe/Berlin
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY j_tasks.sql /docker-entrypoint-initdb.d/j_tasks.sql