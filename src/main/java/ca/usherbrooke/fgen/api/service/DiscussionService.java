package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/discussion")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiscussionService {

    @Inject
    DiscussionMapper discussionMapper;
    @Inject
    DiscussionMemberMapper discussionMemberMapper;

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
        discussionMapper.deleteOne(discussionId);
        return discussionId;
    }

    // POST /api/discussion  → création
    @POST
    public String createDiscussion(Discussion discussion) {
        if (discussion.discussionId == null) {
            discussion.discussionId = discussionMapper.getNewId();
        }
        if (discussion.equipeId != null) {
            discussionMapper.insertDiscussion(discussion);
        } else {
            discussionMapper.insertDiscussionNoEquipe(discussion.discussionId);
        }
        if (discussion.members != null && !discussion.members.isEmpty()) {
            discussionMemberMapper.insertMembers(discussion.discussionId, discussion.members);
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