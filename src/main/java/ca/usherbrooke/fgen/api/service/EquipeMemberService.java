package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.record.TeamMember;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

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
        Equipe equipe = equipeMapper.selectOne(equipeId);
        if (equipe == null || !equipe.administrateurCip.equals(cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        equipeMemberMapper.insertMember(equipeId, memberCip);
        discussionMemberMapper.insertMember(equipe.discussionId, memberCip);
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
        equipeMemberMapper.deleteMember(equipeId, memberCip);
        return memberCip;
    }
}