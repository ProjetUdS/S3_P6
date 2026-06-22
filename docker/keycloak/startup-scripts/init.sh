#!/bin/sh

# Vérifier que les variables sont là
if [ -z "KC_PORT" ] ; then
    echo "Error: KC_PORT not set in .env"
    exit 1
fi

echo "beginnning of installation of keycloak"

/var/tmp/setdata.sh &
/opt/keycloak/bin/kc.sh start-dev --http-port=${KC_PORT}