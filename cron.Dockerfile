# PHP-Image für Cron-Worker laden
FROM php:cli

# Erweiterung für SQL-DB installieren
RUN docker-php-ext-install mysqli

# "php.ini" für Produktion auswählen und kopieren
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Änderungen an "php.ini" kopieren
COPY configs/php_ini_custom.ini /usr/local/etc/php/conf.d/php_ini_custom.ini
RUN chmod 755 /usr/local/etc/php/conf.d/php_ini_custom.ini

# "Cron" und "tzdata" installieren
RUN apt-get update && \
	apt-get -y install cron tzdata && \
	rm -rf /var/lib/apt/lists/*

# Zeit-Informationen kopieren
RUN cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime && \
	echo "Europe/Berlin" > /etc/timezone

# "Cron"-Jobs kopieren und Berechtigungen anpassen
COPY configs/crontab_custom /etc/cron.d/cron
RUN chmod 0644 /etc/cron.d/cron && \
	crontab /etc/cron.d/cron

# Log-Verzeichnis erstellen
RUN mkdir -p /var/log/cron

CMD ["cron", "-f"]
