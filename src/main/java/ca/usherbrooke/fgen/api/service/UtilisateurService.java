package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Utilisateur;
import ca.usherbrooke.fgen.api.mapper.UtilisateurMapper;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.inject.Inject;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.SecurityContext;

import java.util.List;
import java.util.Map;

@Path("/api/utilisateur")
@Produces({"application/json"})
public class UtilisateurService {

    @Context
    SecurityContext securityContext;

    @Inject
    JsonWebToken jwt;

    @Inject
    UtilisateurMapper utilisateurMapper;

    @GET
    @Path("/login")
    public Utilisateur login() {
        Utilisateur p = buildPersonFromJwt();
        utilisateurMapper.createUsager(
                p.cip, p.pseudo, p.courriel, p.nom, p.prenom, null
        );
        return p;
    }

    private Utilisateur buildPersonFromJwt() {
        Utilisateur p = new Utilisateur();
        p.cip = (String) this.jwt.getClaim("cip");
        p.pseudo = (String) this.jwt.getClaim("preferred_username");
        p.nom = (String) this.jwt.getClaim("family_name");
        p.prenom = (String) this.jwt.getClaim("given_name");
        p.courriel = (String) this.jwt.getClaim("email");
        Map realmAccess = (Map) this.jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            p.roles = (List) realmAccess.get("roles");
        }
        return p;
    }

    @GET
    public List<Utilisateur> getUtilisateurs(
            @QueryParam("cip") String cip,
            @QueryParam("pseudo") String pseudo,
            @QueryParam("courriel") String courriel,
            @QueryParam("nom") String nom,
            @QueryParam("prenom") String prenom) {
        return utilisateurMapper.select(cip, pseudo, courriel, nom, prenom);
    }

    @GET
    @Path("/get")
    public Utilisateur getUtilisateur(
            @QueryParam("cip") String cip,
            @QueryParam("pseudo") String pseudo,
            @QueryParam("courriel") String courriel) {
        return utilisateurMapper.selectOne(cip, pseudo, courriel);
    }

    @DELETE
    @Path("/{cip}")
    public String deleteUtilisateur(@PathParam("cip") String cip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        utilisateurMapper.deleteOne(cip);
        return "Deleted (200)";
    }

    @POST
    @Path("/{cip}/contact/{contact_cip}")
    public String ajouteContact(@PathParam("cip") String cip, @PathParam("contact_cip") String cip_contact) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        utilisateurMapper.insertContact(cip, cip_contact);
        return "200";
    }

    @GET
    @Path("/contacts")
    public List<Utilisateur> getContacts(@QueryParam("userCip") String cip) {
        return utilisateurMapper.getContacts(cip);
    }
}