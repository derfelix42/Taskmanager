FROM nginx

WORKDIR "/etc/nginx"
COPY ./configs/nginx.conf nginx.conf
COPY ./.htpasswd .htpasswd
COPY ./404.html 404.html
