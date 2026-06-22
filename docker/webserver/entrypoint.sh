#!/bin/sh

# envsubst uses the environment variables already set in the container
envsubst '${PORT} ${KC_PORT} ${KC_REALM}' < /etc/nginx/nginx.template.conf > /etc/nginx/nginx.conf

exec nginx -g "daemon off;"