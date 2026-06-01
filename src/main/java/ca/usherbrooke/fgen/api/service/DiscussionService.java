package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.mapper.MessageMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiscussionService {

  @Inject MessageMapper messageMapper;

  @GET
  //    Path("")
  public List<Discussion> getDiscussions(
      @Param("cip") List<String> users_id,
      @Param("equipeId") String equipeId,
      @Param("discussionId") String discussionId) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //  @Path("")
  public Discussion getDiscussion(@Param("discussionId") String discussionId) {
    // Todo : implement and add the correct path
    return null;
  }

  @DELETE
  //  @Path("")
  public String deleteDiscussion(@Param("discussionId") String discussionId) {
    // Todo : implement and add the correct path
    return null;
  }

  @POST
  //  @Path("")
  public String createDiscussion(@Param("discussion") Discussion discussion) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  //  @Path("")
  public String getNewId(@Param("discussion") Discussion discussion) {
    // Todo : implement and add the correct path
    return null;
  }
}
