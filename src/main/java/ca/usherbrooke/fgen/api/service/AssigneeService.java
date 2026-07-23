package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.AssigneeMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api/assignee")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssigneeService {

    @Inject
    AssigneeMapper assigneeMapper;
    @Inject
    NotificationService notificationService;

    @Inject
    TacheMapper tacheMapper;

    @Inject
    EquipeMapper equipeMapper;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/{tacheId}")
    public List<String> getAssignees(@PathParam("tacheId") String tacheId) {
        String cipConnecte = (String)jwt.getClaim("cip");

        Tache tache = tacheMapper.selectOne(tacheId);
        String equipeId = tache.equipeId;
        Equipe equipe = equipeMapper.selectOne(equipeId);

        if(equipe == null || equipeMapper.selectMembers(equipeId).stream().noneMatch(m -> m.cip().equals(cipConnecte))) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return assigneeMapper.selectAssignees(tacheId);
    }

    @POST
    @Path("/{tacheId}")
    public String insertAssignee(@PathParam("tacheId") String tacheId, @QueryParam("cip") String cip) {
        String cipConnecte = (String)jwt.getClaim("cip");

        Tache tache = tacheMapper.selectOne(tacheId);
        String equipeId = tache.equipeId;
        Equipe equipe = equipeMapper.selectOne(equipeId);

        if(equipe == null || equipeMapper.selectMembers(equipeId).stream().noneMatch(m -> m.cip().equals(cipConnecte))) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        assigneeMapper.insertAssignee(tacheId, cip);
        notificationService.creerNotification(cip, "taskAssigned",
                "Une tache vous a ete assignee");
        return cip;
    }

    @DELETE
    @Path("/{tacheId}")
    public String deleteAssignee(@PathParam("tacheId") String tacheId, @QueryParam("cip") String cip) {
        String cipConnecte = (String)jwt.getClaim("cip");

        Tache tache = tacheMapper.selectOne(tacheId);
        String equipeId = tache.equipeId;
        Equipe equipe = equipeMapper.selectOne(equipeId);

        if(equipe == null || equipeMapper.selectMembers(equipeId).stream().noneMatch(m -> m.cip().equals(cipConnecte))) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        assigneeMapper.deleteAssignee(tacheId, cip);
        return cip;
    }
}
