package ca.usherbrooke.fgen.api.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.Map;

/**
 * Client vers l'API Account (self-service) de Keycloak :
 * {authServerUrl}/realms/{realm}/account
 *
 * On utilise Map<String, Object> plutôt qu'un DTO strict pour le
 * GET/POST afin de ne perdre aucun champ existant du compte
 * (email, firstName, lastName, attributes...) lors de la mise à jour.
 */
@RegisterRestClient(configKey = "keycloak-account-api")
@Path("/account")
public interface KeycloakAccountClient {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    Response getAccount(@HeaderParam("Authorization") String authorization);

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response updateAccount(@HeaderParam("Authorization") String authorization, Map<String, Object> accountRepresentation);
}
