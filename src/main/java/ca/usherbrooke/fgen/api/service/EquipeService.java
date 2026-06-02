package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Path("/api/equipes")
@Produces({"application/json"})
public class EquipeService {

  @Inject EquipeMapper equipeMapper;

  @GET
  // No path, use equipes
  public List<Equipe> getEquipes(
      @QueryParam("usersCip") List<String> usersCip,
      @QueryParam("equipeId") String equipeId,
      @QueryParam("administrateur") String administrateur,
      @QueryParam("nomEquipe") String nomEquipe) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  @Path("/{equipeID}")
  public Equipe getEquipe(@PathParam("equipeId") String equipeId) {
    // Todo : implement and add the correct path
    return null;
  }

  @DELETE
  @Path("/{equipeID}")
  public String deleteEquipe(@PathParam("equipeId") String equipeId) {
    // Todo : implement and add the correct path
    return null;
  }

  @POST
  //Default top thing
  public String createEquipe(Equipe equipe) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  @Path("/nouveauID")
  public String getNewId() {
    // Todo : implement and add the correct path
    return null;
  }
}
