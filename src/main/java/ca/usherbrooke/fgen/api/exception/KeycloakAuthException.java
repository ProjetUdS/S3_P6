package ca.usherbrooke.fgen.api.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

public class KeycloakAuthException extends WebApplicationException {
    public KeycloakAuthException(Response.Status status) {
        super("Erreur d'authentification Keycloak.", status);
    }
}
