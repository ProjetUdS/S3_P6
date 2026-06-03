package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Path("/api/tache")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TacheService {

  @Inject TacheMapper tacheMapper;

  @GET
  //Use tache
  public List<Tache> getTaches(
      @QueryParam("equipeId") String equipeId,
      @QueryParam("usersID") List<String> usersId,
      @QueryParam("dateCreation") Date dateCreation,
      @QueryParam("nomTache") String nomTache) {
    List<Tache> taches = tacheMapper.select(equipeId, usersId, dateCreation, nomTache);
    return taches;
  }

  @GET
  @Path("/{tacheId}")
  public Tache getTache(@PathParam("tacheId") String tacheId) {
    Tache tache = tacheMapper.selectOne(tacheId);
    return tache;
  }

  @DELETE
  @Path("/{tacheId}")
  public String deleteTache(@PathParam("tacheId") String tacheId) {
    tacheMapper.deleteOne(tacheId);
    return "Tache deleted successfully";
  }

  @POST
  //Utilise tache
  public String createTache(Tache tache) {
    tacheMapper.insertTache(tache);
    return "Tache created successfully";
  }

  @GET
  @Path("/nouveauID")
  public String getNewId() {
    return UUID.randomUUID().toString().replace("-", "");
  }
}
