package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Path("/api/equipes")
@Produces({"application/json"})
public class EquipeService {

  @Inject EquipeMapper equipeMapper;

  @GET
  // No path, use equipes
  public List<Equipe> getEquipes(
      @Param("usersCip") List<String> usersCip,
      @Param("equipeId") String equipeId,
      @Param("administrateur") String administrateur,
      @Param("nomEquipe") String nomEquipe) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  @Path("/{equipeID}")
  public Equipe getEquipe(@Param("equipeId") String equipeId) {
    // Todo : implement and add the correct path
    return null;
  }

  @DELETE
  @Path("/{equipeID}")
  public String deleteEquipe(@Param("equipeId") String equipeId) {
    // Todo : implement and add the correct path
    return null;
  }

  @POST
  @Path("/{equipeID}")
  public String createEquipe(@Param("equipe") Equipe equipe) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  @Path("/nouveauID")
  public String getNewId(@Param("equipe") Equipe equipe) {
    // Todo : implement and add the correct path
    return null;
  }
}
