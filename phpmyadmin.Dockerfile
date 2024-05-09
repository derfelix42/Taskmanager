FROM linuxserver/phpmyadmin

WORKDIR "/app/www/public"
RUN mkdir phpmyadmin
RUN mv * phpmyadmin; exit 0