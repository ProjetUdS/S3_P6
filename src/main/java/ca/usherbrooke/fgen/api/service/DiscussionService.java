package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.mapper.MessageMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Path("/api/discussion")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiscussionService {

  @Inject MessageMapper messageMapper;

  @GET
  //No path use discussion
  public List<Discussion> getDiscussions(
      @QueryParam("cip") List<String> users_id,
      @QueryParam("equipeId") String equipeId,
      @QueryParam("discussionId") String discussionId) {
    // Todo : implement and add the correct path
    return null;
  }

  @GET
  @Path("/{discussionId}")
  public Discussion getDiscussion(@PathParam("discussionId") String discussionId) {
    // Todo : implement and add the correct path
    return null;
  }

  @DELETE
  @Path("/{discussionId}")
  public String deleteDiscussion(@PathParam("discussionId") String discussionId) {
    // Todo : implement and add the correct path
    return null;
  }

  @POST
  //Default top thing
  public String createDiscussion(Discussion discussion) {
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
