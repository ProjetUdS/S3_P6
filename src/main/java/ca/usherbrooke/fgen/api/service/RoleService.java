package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Utilisateur;
import ca.usherbrooke.fgen.api.business.Roles;
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
public class RoleService {
    @Context
    SecurityContext securityContext;
    @Inject
    JsonWebToken jwt;


    @GET
    @Path("/teacher")
    @RolesAllowed({Roles.TEACHER})
    public Utilisateur teacher() {
        Utilisateur p = new Utilisateur();
        p.cip = this.securityContext.getUserPrincipal().getName();
        p.nom = (String)this.jwt.getClaim("family_name");
        p.prenom = (String)this.jwt.getClaim("given_name");
        p.courriel = (String)this.jwt.getClaim("email");
        Map realmAccess = (Map)this.jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            p.roles = (List)realmAccess.get("roles");
        }

        System.out.println(p);
        return p;
    }

    @GET
    @Path("/student")
    @RolesAllowed({"student"})
    public Utilisateur student() {
        Utilisateur p = new Utilisateur();
        p.cip = this.securityContext.getUserPrincipal().getName();
        p.nom = (String)this.jwt.getClaim("family_name");
        p.prenom = (String)this.jwt.getClaim("given_name");
        p.courriel = (String)this.jwt.getClaim("email");
        Map realmAccess = (Map)this.jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            p.roles = (List)realmAccess.get("roles");
        }
        System.out.println(p);
        return p;
    }

    @GET
    @Path("/any")
    @PermitAll
    public Utilisateur me() {
        Utilisateur p = new Utilisateur();
        p.cip = this.securityContext.getUserPrincipal().getName();
        p.nom = (String)this.jwt.getClaim("family_name");
        p.nom = (String)this.jwt.getClaim("given_name");
        p.courriel = (String)this.jwt.getClaim("email");
        Map realmAccess = (Map)this.jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            p.roles = (List)realmAccess.get("roles");
        }

        System.out.println(p);
        return p;
    }

    @GET
    @Path("/test")
    public String test() {
        return "ok";
    }
}
