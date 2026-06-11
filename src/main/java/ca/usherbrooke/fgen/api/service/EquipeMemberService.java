package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.record.TeamMember;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/equipeMember")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EquipeMemberService {

    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @GET
    @Path("/{equipeId}")
    public List<TeamMember> getMembers(@PathParam("equipeId") String equipeId) {
        return equipeMemberMapper.selectMembers(equipeId);
    }

    @POST
    @Path("/{equipeId}")
    public String insertMember(@PathParam("equipeId") String equipeId, @QueryParam("cip") String memberCip) {
        equipeMemberMapper.insertMember(equipeId, memberCip);
        return memberCip;
    }

    @DELETE
    @Path("/{equipeId}")
    public String deleteMember(@PathParam("equipeId") String equipeId, @QueryParam("cip") String memberCip) {
        equipeMemberMapper.deleteMember(equipeId, memberCip);
        return memberCip;
    }
}