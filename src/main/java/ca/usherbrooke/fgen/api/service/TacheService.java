package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

public class TacheService {

  @Inject TacheMapper tacheMapper;

  @GET
  //    @Path("")
  public List<Tache> getTaches(
      @Param("equipeId") String equipeId,
      @Param("usersID") List<String> usersId,
      @Param("dateCreation") Date dateCreation,
      @Param("nomTache") String nomTache) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //    @Path("")
  public List<Tache> getTachesByTeam(@Param("equipeId") String equipeId) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //    @Path("")
  public List<Tache> getTachesByUser(@Param("userId") String userId) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //    @Path("")
  public Tache getTache(@Param("tacheId") String tacheId) {
    // Todo : implement and add the correct path
    return null;
  }

  @DELETE
  //    @Path("")
  public String deleteTache(@Param("tacheId") String tacheId) {
    // Todo : implement and add the correct path
    return null;
  }

  @POST
  //    @Path("")
  public String createTache(@Param("tache") Tache tache) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //    @Path("")
  public String getNewId(@Param("tache") Tache tache) {
    // Todo : implement and add the correct path
    return null;
  }
}
