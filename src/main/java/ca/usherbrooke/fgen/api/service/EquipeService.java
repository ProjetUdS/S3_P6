package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public class EquipeService {

  @Inject EquipeMapper equipeMapper;

  @GET
  //  @Path("")
  public List<Equipe> getEquipes(
      @Param("usersCip") List<String> usersCip,
      @Param("equipeId") String equipeId,
      @Param("administrateur") String administrateur,
      @Param("nomEquipe") String nomEquipe) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //  @Path("")
  public Equipe getEquipe(@Param("equipeId") String equipeId) {
    // Todo : implement and add the correct path
    return null;
  }

  @DELETE
  //  @Path("")
  public String deleteEquipe(@Param("equipeId") String equipeId) {
    // Todo : implement and add the correct path
    return null;
  }

  @POST
  //  @Path("")
  public String createEquipe(@Param("equipe") Equipe equipe) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //  @Path("")
  public String getNewId(@Param("equipe") Equipe equipe) {
    // Todo : implement and add the correct path
    return null;
  }
}
