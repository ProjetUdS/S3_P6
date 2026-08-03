package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.mapper.FichierJointMapper;
import ca.usherbrooke.fgen.api.mapper.MessageMapper;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
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
    EquipeMemberMapper equipeMemberMapper;
    @Inject
    DiscussionMemberMapper discussionMemberMapper;
    @Inject
    MessageMapper messageMapper;
    @Inject
    FichierJointMapper fichierJointMapper;
    @Inject
    MinioStorageService minioStorageService;
    @Inject
    JsonWebToken jwt;

    // GET /api/discussion  → liste les discussions des utilisateurs donnés
    @GET
    public List<Discussion> getDiscussions(
            @QueryParam("usersId") String[] usersId,
            @QueryParam("equipeId") String equipeId,
            @QueryParam("discussionId") String discussionId) {
        String cip = (String) jwt.getClaim("cip");
        List<Discussion> discussions = discussionMapper.select(usersId, equipeId, discussionId);
        discussions.removeIf(discussion -> !discussionMemberMapper.isDiscussionParticipant(discussion.discussionId, cip));
        return discussions;
    }

    // GET /api/discussion/{discussionId}
    @GET
    @Path("/{discussionId}")
    public Discussion getDiscussion(@PathParam("discussionId") String discussionId) {

        String cip = (String) jwt.getClaim("cip");
        Discussion discussion = discussionMapper.selectOne(discussionId);
        if (discussion == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
        if (!discussionMemberMapper.isDiscussionParticipant(discussion.discussionId, cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return discussion;
    }

    // DELETE /api/discussion/{discussionId}
    @DELETE
    @Path("/{discussionId}")
    @Transactional
    public String deleteDiscussion(@PathParam("discussionId") String discussionId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Discussion discussion = discussionMapper.selectOne(discussionId);
        if (discussion == null || !discussion.members.contains(cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        deleteDiscussionResources(discussionId);
        return discussionId;
    }

    void deleteDiscussionResources(String discussionId) {
        List<String> fichierIds = fichierJointMapper.selectFichierIdsByDiscussionId(discussionId);
        for (String fichierId : fichierIds) {
            minioStorageService.removeObject(fichierId);
        }
        messageMapper.deleteByDiscussionId(discussionId);
        discussionMemberMapper.deleteMembersByDiscussionId(discussionId);
        discussionMapper.deleteOne(discussionId);
    }

    // POST /api/discussion  → création
    @POST
    public String createDiscussion(Discussion discussion) {
        if (discussion.discussionId == null) {
            discussion.discussionId = discussionMapper.getNewId();
        }

        String cipConnecte = (String) jwt.getClaim("cip");
        if (discussion.members == null || discussion.members.isEmpty() || !discussion.members.contains(cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        discussion.members.removeIf(member -> discussionMemberMapper.isUserBlocked(member, cipConnecte) || discussionMemberMapper.isUserBlocked(cipConnecte, member));
        //Si la personne est dans l'équipe, mais pas dans le chat pour une raison random
        if (discussion.equipeId != null) {
            Equipe equipe = equipeMapper.selectOne(discussion.equipeId);
            if (equipe == null) throw new WebApplicationException(Response.Status.NOT_FOUND);
            if (!equipeMemberMapper.isMember(equipe.equipeId, cipConnecte))
                throw new WebApplicationException(Response.Status.FORBIDDEN);
            discussionMemberMapper.insertMember(equipe.discussionId, cipConnecte);
            return equipe.discussionId;
        }

        discussionMapper.insertDiscussion(discussion);
        discussionMemberMapper.insertMembers(discussion.discussionId, discussion.members);

        return discussion.discussionId;
    }

    // GET /api/discussion/nouveauID
    @GET
    @Path("/nouveauID")
    public String getNewId() {
        return discussionMapper.getNewId();
    }
}