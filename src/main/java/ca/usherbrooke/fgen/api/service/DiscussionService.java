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
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/discussion")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiscussionService {
    private static final Logger log = Logger.getLogger(DiscussionService.class);

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
          log.infof("createDiscussion: equipeId=%s, existing discussionId=%s", discussion.equipeId, equipe != null ? equipe.discussionId : "NO_EQUIPE");
          if (equipe != null && equipe.discussionId != null) {
              log.infof("Discussion %s already exists for equipe %s, reusing it", equipe.discussionId, discussion.equipeId);
              if (!discussionMemberMapper.isDiscussionParticipant(equipe.discussionId, cipConnecte)) {
                  discussionMemberMapper.insertMember(equipe.discussionId, cipConnecte);
              }
                  return equipe.discussionId;
              }
          }

          log.infof("createDiscussion: creating new discussion for equipeId=%s", discussion.equipeId);

    discussionMapper.insertDiscussion(discussion);

    if (discussion.members != null && !discussion.members.isEmpty()) {
      discussionMemberMapper.insertMembers(discussion.discussionId, discussion.members);
    }

    if (discussion.equipeId != null) {
      equipeMapper.updateDiscussionId(discussion.equipeId, discussion.discussionId);
    }

      if (discussion.equipeId != null) {
          int updated = equipeMapper.updateDiscussionId(discussion.equipeId, discussion.discussionId);
          log.infof("createDiscussion: updateDiscussionId returned %d for equipeId=%s, discussionId=%s",
                  updated, discussion.equipeId, discussion.discussionId);
          if (updated == 0) {
              Equipe equipe = equipeMapper.selectOne(discussion.equipeId);
              log.infof("createDiscussion: update returned 0, selectOne gives discussionId=%s",
                      equipe != null ? equipe.discussionId : "NO_EQUIPE");
              if (equipe != null && equipe.discussionId != null) {
                  log.infof("Race condition: using existing discussion %s for equipe %s", equipe.discussionId, discussion.equipeId);
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