#!/bin/sh

#  Vérifier que les variables sont là
if [ -z "$KEYCLOAK_ADMIN" ] || [ -z "$KEYCLOAK_ADMIN_PASSWORD" ] || [ -z "$KC_REALM_NAME" ]; then
    echo "Error: KEYCLOAK_ADMIN or KEYCLOAK_ADMIN_PASSWORD or KC_REALM_NAME not set in .env"
    exit 1
fi

#  Attendre que keycloak soit prêt
until /opt/keycloak/bin/kcadm.sh config credentials \
    --server "$KC_SERVER_URL" \
    --realm master \
    --user "$KEYCLOAK_ADMIN" \
    --password "$KEYCLOAK_ADMIN_PASSWORD" 2>/dev/null; do
    echo "Keycloak is still starting, waiting 5 seconds..."
    sleep 5
done


echo "keycloak est ready. Beginning of finalisation ...."

# Authentification
/opt/keycloak/bin/kcadm.sh config credentials \
    --server "$KC_SERVER_URL" \
    --realm master \
    --user "$KEYCLOAK_ADMIN" \
    --password "$KEYCLOAK_ADMIN_PASSWORD"

# Configure realm
/opt/keycloak/bin/kcadm.sh create realms -s "realm=$KC_REALM_NAME" -s "enabled=true" -o

# Update realm
/opt/keycloak/bin/kcadm.sh update "realms/$KC_REALM_NAME" -s "registrationAllowed=true"
/opt/keycloak/bin/kcadm.sh update "realms/$KC_REALM_NAME" -s "registrationAllowed=true" -s "loginTheme=customized"

# Create clients
/opt/keycloak/bin/kcadm.sh create clients -r "$KC_REALM_NAME" -f /var/tmp/frontend.json
/opt/keycloak/bin/kcadm.sh create clients -r "$KC_REALM_NAME" -f /var/tmp/backend.json

# Create users in client
/opt/keycloak/bin/kcadm.sh create partialImport \
    -r "$KC_REALM_NAME" \
    -s ifResourceExists=SKIP \
    -f /var/tmp/users.json

echo -e -n "\r"
echo "server running ...."

#Logging as user
#http://localhost:8180/realms/usager/account/

#Manage as admin
#http://localhost:8180/realms/master/account/#/personal-info

#Normal
#localhost