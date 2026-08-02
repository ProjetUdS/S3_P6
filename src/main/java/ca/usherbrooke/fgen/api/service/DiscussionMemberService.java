package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.business.DiscussionMemberSummary;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api/discussionMember")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiscussionMemberService {

    @Inject
    DiscussionMemberMapper discussionMemberMapper;
    @Inject
    DiscussionMapper discussionMapper;
    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/conversations")
    public List<DiscussionMemberSummary> getConversations(@QueryParam("cip") String cip) {
        String cipConnecte = jwt.getClaim("cip");
        if(cipConnecte == null || !(cipConnecte.equals(cip))) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        return discussionMemberMapper.selectConversations(cip);
    }

    @POST
    @Path("/{discussionId}")
    public String changeState(@PathParam("discussionId") String discussionId, @QueryParam("cip") String cip, @QueryParam("etat") String etat) {
        String cipConnecte = (String)jwt.getClaim("cip");
        Discussion discussion = discussionMapper.selectOne(discussionId);

        if(discussion == null || !discussion.members.contains(cipConnecte) || !cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        discussionMemberMapper.changeState(discussionId, cip, etat);
        return "OK";
    }

    @DELETE
    @Path("/{discussionId}")
    public String deleteMember(@PathParam("discussionId") String discussionId, @QueryParam("cip") String cip) {
        String cipConnecte = (String)jwt.getClaim("cip");
        Discussion discussion = discussionMapper.selectOne(discussionId);

        if(discussion == null || !discussion.members.contains(cipConnecte) || !cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        discussionMemberMapper.deleteMember(discussionId, cip);

        if (discussionMapper.select(null, null, discussionId) == null) {
            discussionMapper.deleteOne(discussionId);
        }
        return cip;
    }
}
