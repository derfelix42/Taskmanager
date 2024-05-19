# Getting started

Clone this repo onto your machine of choice running docker and docker compose:

`git clone https://github.com/derfelix42/Taskmanager.git`

Then go into the newly created folder `Taskmanager` and simply run:

`docker compose up`

The first startup will take more time.



> Disclaimer: This project is currently a "It works on my system". This page is a first draft for a getting started with no guarantees to be complete or anything.

You will need:
* Apache2 + PHP 7.4 or higher (check with phpinfo.php)
* MySQL Server like mariadb
* phpmyadmin is a good idea

Clone this repo into `/var/www/html/Taskmanager` and use `j_tasks.sql` to setup your database called `j_tasks`.

To connect the _Taskmanager_ to your DB, create the file `includes/credentials.php` (based on the sample config in the same folder).

After that you should be able to use this project. Please keep in mind that this is still in heavy development!

If you want more information, you can also contact me through the information you find on my github profile.
If you find something to be missing here, please let me know or create a merge request ; )

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