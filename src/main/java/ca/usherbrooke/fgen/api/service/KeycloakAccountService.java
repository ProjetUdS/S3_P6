package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.client.KeycloakAccountClient;
import ca.usherbrooke.fgen.api.exception.InvalidUsernameException;
import ca.usherbrooke.fgen.api.exception.KeycloakAuthException;
import ca.usherbrooke.fgen.api.exception.UsernameAlreadyTakenException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import java.util.Map;

@ApplicationScoped
public class KeycloakAccountService {

    private static final Logger log = Logger.getLogger(KeycloakAccountService.class);

    @Inject
    @RestClient
    KeycloakAccountClient keycloakClient;

    /**
     * Met à jour le username Keycloak de l'utilisateur courant.
     * Fait un GET du compte d'abord pour ne pas perdre email/firstName/lastName
     * lors du POST (l'API Account de Keycloak attend la représentation complète).
     *
     * @param userJwtToken le token JWT brut de l'utilisateur (sans "Bearer ")
     * @param newUsername  le nouveau username désiré
     */
    @SuppressWarnings("unchecked")
    public void updateUsername(String userJwtToken, String newUsername) {
        String bearer = "Bearer " + userJwtToken;

        Response getResponse = callClient(() -> keycloakClient.getAccount(bearer));
        Map<String, Object> account;
        try {
            if (getResponse.getStatus() != 200) {
                throw mapError(getResponse.getStatus());
            }
            account = getResponse.readEntity(Map.class);
        } finally {
            getResponse.close();
        }

        account.put("username", newUsername);

        Response updateResponse = callClient(() -> keycloakClient.updateAccount(bearer, account));
        try {
            int status = updateResponse.getStatus();
            if (status != 200 && status != 204) {
                throw mapError(status);
            }
        } finally {
            updateResponse.close();
        }
    }

    /**
     * Exécute l'appel réseau et n'attrape que les exceptions que le client
     * REST pourrait lancer automatiquement (filet de sécurité, au cas où
     * disable-default-mapper ne suffit pas) — ne touche pas aux erreurs
     * qu'on lance nous-mêmes après coup selon le code de statut.
     */
    private Response callClient(java.util.function.Supplier<Response> call) {
        try {
            return call.get();
        } catch (WebApplicationException e) {
            throw mapError(e.getResponse() != null ? e.getResponse().getStatus() : 500);
        }
    }

    private WebApplicationException mapError(int status) {
        log.warnf("Keycloak account API a retourné %d lors d'une mise à jour de username", status);
        return switch (status) {
            case 409 -> new UsernameAlreadyTakenException();
            case 400 -> new InvalidUsernameException();
            // IMPORTANT : on ne renvoie JAMAIS 401/403 au frontend ici.
            // L'intercepteur axios global (api.js) traite tout 401 comme
            // "ta session Keycloak a expiré" et force une déconnexion.
            // Un 401 de l'API Account de Keycloak est un problème entre
            // NOTRE backend et Keycloak, pas un problème avec la session
            // de l'utilisateur — donc on le traduit en 502 (erreur de
            // service en amont) pour ne pas déclencher ce comportement.
            case 401, 403 -> new KeycloakAuthException(Response.Status.BAD_GATEWAY);
            default -> new WebApplicationException("Erreur Keycloak inattendue (" + status + ")", Response.Status.BAD_GATEWAY);
        };
    }
}