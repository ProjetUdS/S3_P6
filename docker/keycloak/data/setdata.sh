#!/bin/sh

until /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8180/ --realm master --user admin --password admin 2>/dev/null; do
    echo "Keycloak is still starting, waiting 5 seconds..."
    sleep 5
done

echo "beginning of finalisation ...."
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8180/ --realm master --user admin --password admin
/opt/keycloak/bin/kcadm.sh create realms -s realm=usager -s enabled=true -o
/opt/keycloak/bin/kcadm.sh update realms/usager -s registrationAllowed=true
/opt/keycloak/bin/kcadm.sh create clients -r usager -f /var/tmp/frontend.json
/opt/keycloak/bin/kcadm.sh create clients -r usager -f /var/tmp/backend.json

echo -e -n "\r"
echo "server running ...."

#Logging as user
http://localhost:8180/realms/usager/account/

#Manage as admin
http://localhost:8180/realms/master/account/#/personal-info

#Normal
localhost