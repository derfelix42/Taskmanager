FROM linuxserver/phpmyadmin

WORKDIR "/app/www/public"
RUN if [ ! -d "phpmyadmin" ]; then mkdir phpmyadmin; mv * phpmyadmin; fi; exit 0