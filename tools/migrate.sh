#!/usr/bin/env bash
set -euo pipefail

### Info: This file was written using VSCode Agent Mode with `GPT-5 mini`

# Usage: migrate.sh [<host> <port> <user> <password> <database> <migrations_dir>]
# Environment variables (preferred): MYSQL_HOST, MYSQL_PORT, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE, MIGRATIONS_DIR
HOST=${MYSQL_HOST:-${1:-mariadb}}
PORT=${MYSQL_PORT:-${2:-3306}}
USER=${MYSQL_USERNAME:-${MYSQL_USER:-${3:-root}}}
PASSWORD=${MYSQL_PASSWORD:-${4:-}}
DATABASE=${MYSQL_DATABASE:-${5:-j_tasks}}
MIGRATIONS_DIR=${MIGRATIONS_DIR:-${6:-/migrations}}

echo "Waiting for database ${HOST}:${PORT}..."
until mysql -h"${HOST}" -P"${PORT}" -u"${USER}" -p"${PASSWORD}" -e "SELECT 1" >/dev/null 2>&1; do
  echo "Database not ready - sleeping 1s"
  sleep 1
done
echo "Database is ready."

# Ensure migrations table exists
mysql -h"${HOST}" -P"${PORT}" -u"${USER}" -p"${PASSWORD}" "${DATABASE}" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "Applying migrations from ${MIGRATIONS_DIR}"

shopt -s nullglob
files=("${MIGRATIONS_DIR}"/*.sql)
if [ ${#files[@]} -eq 0 ]; then
  echo "No migrations found in ${MIGRATIONS_DIR}."
  exit 0
fi

# Sort by filename (they are named like 001-name.sql)
IFS=$'\n' sorted=( $(printf "%s\n" "${files[@]}" | sort) )

for f in "${sorted[@]}"; do
  filename=$(basename "$f")
  # Check if applied
  if mysql -h"${HOST}" -P"${PORT}" -u"${USER}" -p"${PASSWORD}" -N -s -e \
       "SELECT filename FROM schema_migrations WHERE filename='${filename}'" "${DATABASE}" | grep -q "${filename}"; then
    echo "Skipping already applied migration: ${filename}"
    continue
  fi

  echo "Applying migration: ${filename}"
  if mysql -h"${HOST}" -P"${PORT}" -u"${USER}" -p"${PASSWORD}" "${DATABASE}" < "$f"; then
    mysql -h"${HOST}" -P"${PORT}" -u"${USER}" -p"${PASSWORD}" -e \
      "INSERT INTO schema_migrations (filename) VALUES ('${filename}')" "${DATABASE}"
    echo "Applied: ${filename}"
  else
    echo "Failed to apply: ${filename}" >&2
    exit 1
  fi
done

echo "All migrations applied."
