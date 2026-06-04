package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Utilisateur;
import ca.usherbrooke.fgen.api.mapper.UtilisateurMapper;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.inject.Inject;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.SecurityContext;

import java.util.List;
import java.util.Map;

@Path("/api/utilisateur")
@Produces({"application/json"})
public class UtilisateurService {
    @Context    SecurityContext securityContext;
    @Inject    JsonWebToken jwt;

    @Inject    UtilisateurMapper utilisateurMapper;

    @GET
    @Path("/login")
    public Utilisateur login() {
        Utilisateur p = buildPersonFromJwt();

        utilisateurMapper.createUsager(
                p.cip, p.pseudo, p.courriel, p.nom, p.prenom, null // TODO add when there
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
    //Default path
    public List<Utilisateur> getUtilisateurs(
            @QueryParam("cip") String cip,
            @QueryParam("pseudo") String pseudo,
            @QueryParam("courriel") String courriel,
            @QueryParam("nom") String nom,
            @QueryParam("prenom") String prenom,
            @QueryParam("photoProfilId") String photoProfilId) {
        // Todo : implement and add the correct path
        return utilisateurMapper.select(cip,pseudo,nom,prenom);
    }

    @GET
    @Path("/{cip}")
    public Utilisateur getUtilisateur(
            @PathParam("cip") String cip,
            @QueryParam("pseudo") String pseudo,
            @QueryParam("nom") String nom,
            @QueryParam("prenom") String prenom) {
        // Todo : implement and add the correct path
        return null;
    }

    @DELETE
    @Path("/{cip}")
    public String deleteUtilisateur(@PathParam("cip") String cip) {
        // Todo : implement and add the correct path
        return null;
    }

    @POST
    @Path("/{cip}/contact/{contact_cip}")
    public String ajouteContact(@PathParam("cip") String cip, @PathParam("contact_cip") String contact) {
        // Todo : Vérification et conditions?
        utilisateurMapper.insertContact(cip, contact);
        return "200";
    }

  @GET
  @Path("/contacts")
  public List<Utilisateur> getContacts(@QueryParam("userCip") String cip) {
    return utilisateurMapper.getContacts(cip);
  }
}
