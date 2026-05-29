package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Person;
import ca.usherbrooke.fgen.api.business.Roles;
import ca.usherbrooke.fgen.api.mapper.LoginMapper;
import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

import jakarta.annotation.security.PermitAll;

import jakarta.inject.Inject;

import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.SecurityContext;
import java.util.List;
import java.util.Map;

@Path("/api")
@Produces({"application/json"})
public class LoginService {
    @Context
    SecurityContext securityContext;
    @Inject
    JsonWebToken jwt;

    @Inject
    LoginMapper loginMapper;

    @GET
    @Path("/login")
    public Person login() {
        Person p = buildPersonFromJwt();

        loginMapper.createUsager(
                p.cip,
                p.cip,
                p.email,
                p.last_name,
                p.first_name,
                null //TODO add when there
        );

        return p;
    }

    private Person buildPersonFromJwt() {
        Person p = new Person();
        p.cip = this.securityContext.getUserPrincipal().getName();
        p.last_name = (String)this.jwt.getClaim("family_name");
        p.first_name = (String)this.jwt.getClaim("given_name");
        p.email = (String)this.jwt.getClaim("email");

        Map realmAccess = (Map)this.jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            p.roles = (List)realmAccess.get("roles");
        }

        return p;
    }

}
