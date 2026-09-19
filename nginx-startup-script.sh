#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/certificate.cert"
KEY_FILE="$CERT_DIR/certificate.key"

mkdir -p "$CERT_DIR"

if [ ! -s "$CERT_FILE" ] || [ ! -s "$KEY_FILE" ]; then
  echo "Generating self-signed certificate..."
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 3650 \
    -subj "/CN=${CERT_DOMAIN:-localhost}" \
    -addext "subjectAltName=DNS:${CERT_DOMAIN:-localhost}"
  chmod 600 "$KEY_FILE"
fi