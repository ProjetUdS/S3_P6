package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.record.TeamMember;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.*;

@Path("/api/equipes")
@Consumes(MediaType.APPLICATION_JSON)
@Produces({"application/json"})
public class EquipeService {

    @Inject
    EquipeMapper equipeMapper;

    @Inject
    DiscussionMapper discussionMapper;

    @Inject
    DiscussionMemberMapper discussionMemberMapper;

    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @Inject
    JsonWebToken jwt;

    @Inject
    NotificationService notificationService;

    @Inject
    DiscussionService discussionService;

    @GET
    public List<Equipe> select(
            @QueryParam("usersCip[]") String[] usersCip,
            @QueryParam("equipeId") String equipeId,
            @QueryParam("administrateur") String administrateur,
            @QueryParam("nomEquipe") String nomEquipe) {
        String cipConnecte = (String) jwt.getClaim("cip");

        List<Equipe> equipes = equipeMapper.select(usersCip, equipeId, administrateur, nomEquipe);
        equipes.removeIf(equipe -> !equipeMemberMapper.isMember(equipe.equipeId, cipConnecte));
        return equipes;
    }

    @GET
    @Path("/{equipeId}")
    public Equipe selectOne(@PathParam("equipeId") String equipeId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!equipeMemberMapper.isMember(equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return equipeMapper.selectOne(equipeId);
    }

    @GET
    @Path("/{equipeId}/members")
    public List<TeamMember> selectMembers(@PathParam("equipeId") String equipeId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!equipeMemberMapper.isMember(equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return equipeMapper.selectMembers(equipeId);
    }

    @DELETE
    @Path("/{equipeId}")
    @Transactional
    public String deleteOne(@PathParam("equipeId") String equipeId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Equipe equipe = equipeMapper.selectOne(equipeId);
        if (equipe == null || !equipe.administrateurCip.equals(cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        equipeMapper.deleteOne(equipeId);
        discussionService.deleteDiscussionResources(equipe.discussionId);
        return equipeId;
    }

    @POST
    public String insertEquipe(Equipe equipe, @QueryParam("membersCip") List<String> membersCip, @QueryParam("membersCip[]") List<String> membersCipBrackets) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(equipe.administrateurCip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        if (equipe.equipeId == null) {
            equipe.equipeId = UUID.randomUUID().toString().replace("-", "");
        }

        //Crée la discussion
        Discussion discussion = new Discussion();
        discussion.discussionId = UUID.randomUUID().toString().replace("-", "");
        discussionMapper.insertDiscussion(discussion);
        equipe.discussionId = discussion.discussionId;


        equipeMapper.insertEquipe(equipe);

        // ALWAYS add the creator
        equipeMemberMapper.insertMember(equipe.equipeId, cipConnecte);
        discussionMemberMapper.insertMember(equipe.discussionId, cipConnecte);

        List<String> allMembers = new ArrayList<>();
        if (membersCip != null) allMembers.addAll(membersCip);
        if (membersCipBrackets != null) allMembers.addAll(membersCipBrackets);

        for (String cip : allMembers) {
            if (cip.equals(cipConnecte)) continue;
            if (discussionMemberMapper.isUserBlocked(cipConnecte, cip) || discussionMemberMapper.isUserBlocked(cip, cipConnecte)) {
                continue;
            }
            equipeMemberMapper.insertMember(equipe.equipeId, cip);
            discussionMemberMapper.insertMember(equipe.discussionId, cip);

            EquipeWebSocket.broadcast(cip, JsonUtil.toJson(Map.of("type", "teamCreated")));
            try {
                notificationService.creerNotification(cip, "teamCreated", "Vous avez été ajouté à l'équipe: " + equipe.nomEquipe, cipConnecte);
            } catch (Exception e) {
                // non-critical
            }
        }
        EquipeWebSocket.broadcast(cipConnecte, JsonUtil.toJson(Map.of("type", "teamCreated")));
        return equipe.equipeId;
    }

    @GET
    @Path("/nouveauID")
    public String getNewId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}