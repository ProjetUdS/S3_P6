package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Person;
import ca.usherbrooke.fgen.api.mapper.UtilisateurMapper;
import jakarta.ws.rs.*;
import org.apache.ibatis.annotations.Param;
import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.inject.Inject;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.SecurityContext;
import java.util.List;
import java.util.Map;

@Path("/api/utilisateur")
@Produces({"application/json"})
public class UtilisateurService {
  @Context SecurityContext securityContext;
  @Inject JsonWebToken jwt;

  @Inject UtilisateurMapper loginMapper;

  @GET
  @Path("/login")
  public Person login() {
    Person p = buildPersonFromJwt();

    loginMapper.createUsager(
        p.cip, p.username, p.email, p.last_name, p.first_name, null // TODO add when there
        );

    return p;
  }

  private Person buildPersonFromJwt() {
    Person p = new Person();
    p.cip = (String) this.jwt.getClaim("cip");
    p.username = (String) this.jwt.getClaim("preferred_username");
    p.last_name = (String) this.jwt.getClaim("family_name");
    p.first_name = (String) this.jwt.getClaim("given_name");
    p.email = (String) this.jwt.getClaim("email");

    Map realmAccess = (Map) this.jwt.getClaim("realm_access");
    if (realmAccess != null && realmAccess.containsKey("roles")) {
      p.roles = (List) realmAccess.get("roles");
    }

    return p;
  }

  @GET
  //Default path
  public List<Person> getUtilisateurs(
      @QueryParam("cip") String cip,
      @QueryParam("pseudo") String pseudo,
      @QueryParam("courriel") String courriel,
      @QueryParam("nom") String nom,
      @QueryParam("prenom") String prenom,
      @QueryParam("photoProfilId") String photoProfilId) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  @Path("/{cip}")
  public Person getUtilisateur(
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
  public String ajouteContact(@PathParam("cip") String cip, @PathParam("contact") String contact) {
    // Todo : implement and add the correct path
    return null;
  }
}
