package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.DiscussionMemberSummary;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Path("/api/discussionMember")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiscussionMemberService {

    @Inject
    DiscussionMemberMapper discussionMemberMapper;
    @Inject
    DiscussionMapper discussionMapper;

    @GET
    @Path("/conversations")
    public List<DiscussionMemberSummary> getConversations(@QueryParam("cip") String cip) {
        return discussionMemberMapper.selectConversations(cip);
    }

    @POST
    @Path("/{discussionId}")
    public String changeState(@PathParam("discussionId") String discussionId, @QueryParam("cip") String cip, @QueryParam("etat") String etat) {
        discussionMemberMapper.changeState(discussionId, cip, etat);
        return "OK";
    }

    @DELETE
    public String deleteMember(@Param("discussionId") String discussionId, @QueryParam("cip") String cip) {
        discussionMemberMapper.deleteMember(discussionId, cip);

        if (discussionMapper.select(null, null, discussionId) == null) {
            discussionMapper.deleteOne(discussionId);
        }
        return cip;
    }
}
