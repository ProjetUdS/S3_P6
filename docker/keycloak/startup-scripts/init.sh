#!/bin/sh
echo "beginnning of installation of keycloak"

/var/tmp/setdata.sh &
/opt/keycloak/bin/kc.sh start-dev --http-port=8180