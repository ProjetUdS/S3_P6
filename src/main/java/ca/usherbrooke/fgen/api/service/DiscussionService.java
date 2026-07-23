package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api/discussion")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiscussionService {

    @Inject
    DiscussionMapper discussionMapper;
    @Inject
    EquipeMapper equipeMapper;
    @Inject
    DiscussionMemberMapper discussionMemberMapper;
    @Inject
    JsonWebToken jwt;

    // GET /api/discussion  → liste les discussions des utilisateurs donnés
    @GET
    public List<Discussion> getDiscussions(
            @QueryParam("usersId") String[] usersId,
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
        String cipConnecte = (String) jwt.getClaim("cip");
        Discussion discussion = discussionMapper.selectOne(discussionId);
        if(discussion == null|| !discussion.members.contains(cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        discussionMapper.deleteOne(discussionId);
        return discussionId;
    }

  // POST /api/discussion  → création
  @POST
  public String createDiscussion(Discussion discussion) {
    if (discussion.discussionId == null) {
      discussion.discussionId = discussionMapper.getNewId();
    }

    String cipConnecte = (String) jwt.getClaim("cip");
    if(discussion.members.isEmpty() || !discussion.members.contains(cipConnecte)) {
        throw new WebApplicationException(Response.Status.FORBIDDEN);
    }

      // If the discussion is linked to an equipe, check if one already exists
      if (discussion.equipeId != null) {
          Equipe equipe = equipeMapper.selectOne(discussion.equipeId);
          if (equipe != null && equipe.discussionId != null) {
              if (!discussionMemberMapper.isDiscussionParticipant(equipe.discussionId, cipConnecte)) {
                  discussionMemberMapper.insertMember(equipe.discussionId, cipConnecte);
              }
                  return equipe.discussionId;
              }
          }

    discussionMapper.insertDiscussion(discussion);

    if (discussion.members != null && !discussion.members.isEmpty()) {
      discussionMemberMapper.insertMembers(discussion.discussionId, discussion.members);
    }

    if (discussion.equipeId != null) {
      equipeMapper.updateDiscussionId(discussion.equipeId, discussion.discussionId);
    }

      if (discussion.equipeId != null) {
          int updated = equipeMapper.updateDiscussionId(discussion.equipeId, discussion.discussionId);
          if (updated == 0) {
              Equipe equipe = equipeMapper.selectOne(discussion.equipeId);
              if (equipe != null && equipe.discussionId != null) {
                  if (!discussionMemberMapper.isDiscussionParticipant(equipe.discussionId, cipConnecte)) {
                      discussionMemberMapper.insertMember(equipe.discussionId, cipConnecte);
                  }
                  return equipe.discussionId;
              }
          }
      }


      return discussion.discussionId;
  }

  // GET /api/discussion/nouveauID
  @GET
  @Path("/nouveauID")
  public String getNewId() {
    return discussionMapper.getNewId();
  }
}