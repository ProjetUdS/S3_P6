package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.record.TeamMember;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.*;
import java.util.UUID;

@Path("/api/equipes")
@Consumes(MediaType.APPLICATION_JSON)
@Produces({"application/json"})
public class EquipeService {

    @Inject
    EquipeMapper equipeMapper;

    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @Inject
    DiscussionMapper discussionMapper;

    @GET
    public List<Equipe> select(
            @QueryParam("usersCip") String[] usersCip,
            @QueryParam("equipeId") String equipeId,
            @QueryParam("administrateur") String administrateur,
            @QueryParam("nomEquipe") String nomEquipe) {
        return equipeMapper.select(usersCip, equipeId, administrateur, nomEquipe);
    }

    @GET
    @Path("/{equipeId}")
    public Equipe selectOne(@PathParam("equipeId") String equipeId) {
        return equipeMapper.selectOne(equipeId);
    }

    @GET
    @Path("/{equipeId}/members")
    public List<TeamMember> selectMembers(@PathParam("equipeId") String equipeId) {
        return equipeMapper.selectMembers(equipeId);
    }

    @DELETE
    @Path("/{equipeId}")
    public String deleteOne(@PathParam("equipeId") String equipeId) {
        equipeMapper.deleteOne(equipeId);
        return equipeId;
    }

    @POST
    public String insertEquipe(Equipe equipe, @QueryParam("membersCip") List<String> membersCip) {
        if (equipe.equipeId == null) {
            equipe.equipeId = UUID.randomUUID().toString().replace("-", "");
        }

        if(equipe.discussionId == null) {
            Discussion discussion = new Discussion();
            discussion.discussionId  = UUID.randomUUID().toString().replace("-", "");
            discussionMapper.insertDiscussion(discussion);
            equipe.discussionId = discussion.discussionId;
        }

        equipeMapper.insertEquipe(equipe);

        for (String cip : membersCip) {
            equipeMemberMapper.insertMember(equipe.equipeId, cip);
        }

        return equipe.equipeId;
    }

    @GET
    @Path("/nouveauID")
    public String getNewId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
