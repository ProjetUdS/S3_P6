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

@Path("/api")
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
        p.cip, p.cip, p.email, p.last_name, p.first_name, null // TODO add when there
        );

    return p;
  }

  private Person buildPersonFromJwt() {
    Person p = new Person();
    p.cip = this.securityContext.getUserPrincipal().getName();
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
  //    @Path("")
  public List<Person> getUtilisateurs(
      @Param("cip") String cip,
      @Param("pseudo") String pseudo,
      @Param("courriel") String courriel,
      @Param("nom") String nom,
      @Param("prenom") String prenom,
      @Param("photoProfilId") String photoProfilId) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //    @Path("")
  public Person getUtilisateur(
      @Param("cip") String cip,
      @Param("pseudo") String pseudo,
      @Param("nom") String nom,
      @Param("prenom") String prenom) {
    // Todo : implement and add the correct path
    return null;
  }

  @DELETE
  //    @Path("")
  public String deleteUtilisateur(@Param("cip") String cip) {
    // Todo : implement and add the correct path
    return null;
  }

  @POST
  //    @Path("")
  public String ajouteContact(@Param("cip") String cip, @Param("contact") String contact) {
    // Todo : implement and add the correct path
    return null;
  }
}
