FROM nginx

RUN apt update
RUN apt install apache2-utils -y

WORKDIR "/etc/nginx"
COPY ./configs/nginx.conf nginx.conf
COPY ./.htpasswd .htpasswd
COPY ./404.html 404.html
