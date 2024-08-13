# PHP-Image mit Apache-Server laden
FROM php:apache

# Erweiterung für SQL-DB installieren
RUN docker-php-ext-install mysqli

# "php.ini" für Produktion auswählen und kopieren
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Änderungen an "php.ini" kopieren
COPY configs/php_ini_custom.ini /usr/local/etc/php/conf.d/php_ini_custom.ini
RUN chmod 755 /usr/local/etc/php/conf.d/php_ini_custom.ini

# "Cron", "tzdata" und "wget" installieren
RUN apt-get update && \
	apt-get -y install cron tzdata wget

# Zeit-Informationen kopieren
RUN cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime && \
	echo "Europe/Berlin" > /etc/timezone

# "Runitor" installieren
ARG RUNITOR_VERSION=v0.10.1
RUN wget https://github.com/bdd/runitor/releases/download/$RUNITOR_VERSION/runitor-$RUNITOR_VERSION-linux-amd64 -O runitor && \
	mv runitor /usr/local/bin/ && \
	chmod +x /usr/local/bin/runitor

# Cache des Paket-Managers leeren
RUN rm -rf /var/lib/apt/lists/*

# "Cron"-Jobs kopieren und Berechtigungen anpassen
COPY configs/crontab_custom /etc/cron.d/cron
RUN chmod 0644 /etc/cron.d/cron

# "Cron"-Jobs ausführen
RUN crontab /etc/cron.d/cron

# Log-Verzeichnis erstellen
RUN mkdir -p /var/log/cron

# Entrypoint von Apache bearbeiten und "Cron" ergänzen
RUN sed -i 's/^exec /service cron start\n\nexec /' /usr/local/bin/apache2-foreground

# Server-Name für Apache ergänzen
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

COPY www /var/www/html
RUN mkdir /var/www/html/backups
# RUN mkdir /var/log

# RUN tail -f /var/log/apache2/*.log &
ENV LOG_LEVEL=INFO