package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.AssigneeMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.record.TeamMember;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;

@Path("/api/equipeMember")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EquipeMemberService {

    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @Inject
    EquipeMapper equipeMapper;

    @Inject
    DiscussionMemberMapper discussionMemberMapper;

    @Inject
    AssigneeMapper assigneeMapper;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/{equipeId}")
    public List<TeamMember> getMembers(@PathParam("equipeId") String equipeId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!equipeMemberMapper.isMember(equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return equipeMemberMapper.selectMembers(equipeId);
    }

    @POST
    @Path("/{equipeId}")
    public String insertMember(@PathParam("equipeId") String equipeId, @QueryParam("cip") String memberCip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!equipeMemberMapper.isMember(equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        if (discussionMemberMapper.isUserBlocked(cipConnecte, memberCip) || discussionMemberMapper.isUserBlocked(memberCip, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        Equipe equipe = equipeMapper.selectOne(equipeId);
        equipeMemberMapper.insertMember(equipeId, memberCip);
        discussionMemberMapper.insertMember(equipe.discussionId, memberCip);
        EquipeWebSocket.broadcast(memberCip, JsonUtil.toJson(Map.of("type", "teamMemberAdded", "equipeId", equipeId)));
        return memberCip;
    }

    @DELETE
    @Path("/{equipeId}")
    public String deleteMember(@PathParam("equipeId") String equipeId, @QueryParam("cip") String memberCip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Equipe equipe = equipeMapper.selectOne(equipeId);
        if (equipe == null || (!equipe.administrateurCip.equals(cipConnecte) && !cipConnecte.equals(memberCip))) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        boolean adminLeaves = equipe.administrateurCip.equals(memberCip);
        if (adminLeaves) {
            if (equipeMemberMapper.countMembers(equipeId) <= 1) {
                throw new WebApplicationException(Response.status(Response.Status.BAD_REQUEST)
                        .entity("Vous êtes le seul membre de l'équipe. Vous devez supprimer l'équipe pour la quitter.")
                        .build());
            }
            String newAdmin = equipeMemberMapper.selectOldestMember(equipeId, memberCip);
            equipeMapper.updateAdministrateur(equipeId, newAdmin);
            for (TeamMember member : equipeMemberMapper.selectMembers(equipeId)) {
                if (!member.cip().equals(memberCip)) {
                    EquipeWebSocket.broadcast(member.cip(), JsonUtil.toJson(Map.of(
                            "type", "teamAdminChanged",
                            "equipeId", equipeId,
                            "administrateurCip", newAdmin)));
                }
            }
        }

        equipeMemberMapper.deleteMember(equipeId, memberCip);
        discussionMemberMapper.deleteMember(equipe.discussionId, memberCip);
        assigneeMapper.deleteAssigneesByTeamAndCip(equipeId, memberCip);
        TacheWebSocket.broadcast(equipeId, JsonUtil.toJson(Map.of("type", "taskUpdated")));
        if (!cipConnecte.equals(memberCip)) {
            EquipeWebSocket.broadcast(memberCip, JsonUtil.toJson(Map.of("type", "teamMemberRemoved", "equipeId", equipeId)));
        }
        return memberCip;
    }
}