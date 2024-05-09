FROM mariadb:latest

ENV TZ="Europe/Berlin"
# RUN date

# RUN echo "Europe/Berlin" > /etc/timezone
# RUN dpkg-reconfigure -f noninteractive tzdata