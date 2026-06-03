package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/discussion")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiscussionService {

  @Inject DiscussionMapper discussionMapper;

  // GET /api/discussion  → liste les discussions des utilisateurs donnés
  @GET
  public List<Discussion> getDiscussions(
          @QueryParam("cip") List<String> usersId,
          @QueryParam("equipeId") String equipeId,
          @QueryParam("discussionId") String discussionId) {
    return discussionMapper.select(usersId, equipeId, discussionId);
  }

  // GET /api/discussion/{discussionId}
  @GET
  @Path("/{discussionId}")
  public Discussion getDiscussion(@PathParam("discussionId") String discussionId) {
    return discussionMapper.selectOne(discussionId);
  }

  // DELETE /api/discussion/{discussionId}
  @DELETE
  @Path("/{discussionId}")
  public String deleteDiscussion(@PathParam("discussionId") String discussionId) {
    discussionMapper.deleteOne(discussionId);
    return discussionId;
  }

  // POST /api/discussion  → création
  @POST
  public String createDiscussion(Discussion discussion) {
    if (discussion.discussionId == null) {
      discussion.discussionId = discussionMapper.getNewId();
    }
    discussionMapper.insertDiscussion(discussion);
    return discussion.discussionId;
  }

  // GET /api/discussion/nouveauID
  @GET
  @Path("/nouveauID")
  public String getNewId() {
    return discussionMapper.getNewId();
  }
}