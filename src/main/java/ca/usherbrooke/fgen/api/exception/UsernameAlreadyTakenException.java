package ca.usherbrooke.fgen.api.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

public class UsernameAlreadyTakenException extends WebApplicationException {
    public UsernameAlreadyTakenException() {
        super("Ce pseudo est déjà utilisé.", Response.Status.CONFLICT);
    }
}
