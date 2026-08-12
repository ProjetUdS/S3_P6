#!/bin/sh

echo "beginning of installation of keycloak"

# Start Keycloak in background
/var/tmp/configs/setdata.sh &
/opt/keycloak/bin/kc.sh start-dev