FROM nginx:1.27

RUN apt update
RUN apt install apache2-utils -y

WORKDIR "/etc/nginx"
COPY ./configs/nginx.conf nginx.conf
COPY ./.htpasswd .htpasswd
COPY ./404.html 404.html
COPY ./nginx-startup-script.sh /docker-entrypoint.d/05-generate-certificate.sh
