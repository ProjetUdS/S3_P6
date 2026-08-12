package ca.usherbrooke.fgen.api.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

public class InvalidUsernameException extends WebApplicationException {
    public InvalidUsernameException() {
        super("Pseudo invalide selon Keycloak.", Response.Status.BAD_REQUEST);
    }
}
