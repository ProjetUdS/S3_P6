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
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  @Path("/{tacheId}")
  public Tache getTache(@PathParam("tacheId") String tacheId) {d) {
    // Todo : implement and add the correct path
    return null;
  }

  @DELETE
  @Path("/{tacheId}")
  public String deleteTache(@PathParam("tacheId") String tacheId) {
    // Todo : implement and add the correct path
    return null;
  }

  @POST
  //Utilise tache
  public String createTache(Tache tache) {
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
