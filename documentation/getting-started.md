# Getting started

Clone this repo onto your machine of choice running docker and docker compose:

`git clone https://github.com/derfelix42/Taskmanager.git`

Then go into the newly created folder `Taskmanager` and simply run:

`docker compose up`

The first startup will obviously take some time.

You can then visit your Taskmanager instance at `https://<ip-of-your-machine>/`. The default credentials are `test`, `test`.

> You need to setup your credentials in the `.htpasswd` file, see below!

## System Requirements
Will need to be investigated in the future.

My personal Instance is running on a `Raspberry Pi 4 with 2GB RAM` sufficient enough for heavy daily use.


## Set Website Password
The Taskmanager uses simple http auth to authenticate users. The default username/password is `test/test`.
You need to update this to something more secure.

Execute the following command in this projects root folder to overwrite the existing `.htpasswd` file. You will be prompted for the new password.
```
sudo htpasswd -c .htpasswd username
```

## Cron Jobs
You can define Cron-Jobs that are stored in the DB and can be toggle from the frontend. The file `cron.php` in the document root should be executed once per minute. This does also handle backups!

```
1 * * * * /usr/bin/php /var/www/html/Taskmanager/cron.php >> /var/www/html/Taskmanager/logs/cronlogs
```

You might need to change the `$_SERVER['DOCUMENT_ROOT']` in `cron.php` and the above command to fit your specific Server Locations.

## Certificates
By default TLS keys will be generated on startup by traefik.

But you can also add your own `.key` and `.cert` file in `./certs` you got from lets encrypt or as from cloudflare as origin server certificate.

You can name them `certificate.key` and `certificate.cert`.

## DynDNS
If you host your own instance at home, you might want to get DynDNS to automagically update your home IP whenever it changes.

As I use cloudflare as my DNS for the domain I am using, I use the docker image [`cloudflare-ddns`](https://hub.docker.com/r/oznu/cloudflare-ddns/). I created the following `docker-compose.yml` in another folder called `cloudflare-ddns`:

```yml
version: '2'
services:
  cloudflare-ddns:
    image: oznu/cloudflare-ddns:latest
    restart: always
    environment:
      - API_KEY=REPLACE_ME
      - ZONE=example.com
      - SUBDOMAIN=subdomain
      - PROXIED=true
```

(I am using a proxied entry to hide my real home IP)