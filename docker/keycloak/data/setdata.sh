#!/bin/sh

#  Vérifier que les variables sont là
if [ -z "$KC_BOOTSTRAP_ADMIN_USERNAME" ] || [ -z "$KC_BOOTSTRAP_ADMIN_PASSWORD" ] || [ -z "$KC_REALM_NAME" ]; then
    echo "Error: KC_BOOTSTRAP_ADMIN_USERNAME or KC_BOOTSTRAP_ADMIN_PASSWORD or KC_REALM_NAME not set in .env"
    exit 1
fi

#  Attendre que keycloak soit prêt
until /opt/keycloak/bin/kcadm.sh config credentials \
    --server "$KC_LOCAL_URL" \
    --realm master \
    --user "$KC_BOOTSTRAP_ADMIN_USERNAME" \
    --password "$KC_BOOTSTRAP_ADMIN_PASSWORD" 2>/dev/null; do
    echo "Keycloak is still starting, waiting 5 seconds..."
    sleep 5
done

echo "keycloak est ready. Beginning of finalisation ...."

# Configure realm
/opt/keycloak/bin/kcadm.sh create realms -s "realm=$KC_REALM_NAME" -s "enabled=true" -o

# Update realm
/opt/keycloak/bin/kcadm.sh update "realms/$KC_REALM_NAME" -s "registrationAllowed=true"
/opt/keycloak/bin/kcadm.sh update "realms/$KC_REALM_NAME" -s "registrationAllowed=true" -s "loginTheme=customized"

# Configure acceptable variables
/opt/keycloak/bin/kcadm.sh update "realms/$KC_REALM_NAME/users/profile" -f /var/tmp/declarative-user-profile.json

# Substitute env vars in JSON templates before importing
sed "s|\${KC_SERVER_URL}|${KC_SERVER_URL}|g" /var/tmp/frontend.json > /tmp/frontend-sub.json
sed -e "s|\${KC_SERVER_URL}|${KC_SERVER_URL}|g" -e 's|\$(OIDC_SECRET)|'"${OIDC_SECRET}"'|g' \
    /var/tmp/backend.json > /tmp/backend-sub.json

# Create clients
/opt/keycloak/bin/kcadm.sh create clients -r "$KC_REALM_NAME" -f /tmp/frontend-sub.json
/opt/keycloak/bin/kcadm.sh create clients -r "$KC_REALM_NAME" -f /tmp/backend-sub.json

# Clean up temporary files
rm -f /tmp/frontend-sub.json /tmp/backend-sub.json


# Create users in client
/opt/keycloak/bin/kcadm.sh create partialImport \
    -r "$KC_REALM_NAME" \
    -s ifResourceExists=SKIP \
    -f /var/tmp/users.json

echo -e -n "\r"
echo "server running ...."
