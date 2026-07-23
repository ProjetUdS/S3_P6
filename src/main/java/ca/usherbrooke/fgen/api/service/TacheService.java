package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import ca.usherbrooke.fgen.api.mapper.AssigneeMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

@Path("/api/tache")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TacheService {

    @Inject
    TacheMapper tacheMapper;

    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @Inject
    AssigneeMapper assigneeMapper;

    @Inject
    NotificationService notificationService;

    @Inject
    JsonWebToken jwt;

    @GET
    public List<Tache> getTaches(
            @QueryParam("equipeId") String equipeId,
            @QueryParam("usersID") List<String> usersId,
            @QueryParam("dateCreation") Date dateCreation,
            @QueryParam("nomTache") String nomTache) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (equipeId != null && !equipeMemberMapper.isMember(equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return tacheMapper.select(equipeId, usersId, dateCreation, nomTache);
    }

    @GET
    @Path("/deadlines")
    public List<Tache> getDeadlines(@QueryParam("equipeId") String equipeId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!equipeMemberMapper.isMember(equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return tacheMapper.deadlines(equipeId);
    }

    @GET
    @Path("/calendrier")
    public List<Tache> getCalendrier(
            @QueryParam("equipeId") String equipeId,
            @QueryParam("dateMin") LocalDate dateMin,
            @QueryParam("dateMax") LocalDate dateMax) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!equipeMemberMapper.isMember(equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return tacheMapper.calendrierEquipe(equipeId, dateMin, dateMax);
    }

    @GET
    @Path("/{tacheId}")
    public Tache getTache(@PathParam("tacheId") String tacheId) {
        return tacheMapper.selectOne(tacheId);
    }

    @DELETE
    @Path("/{tacheId}")
    public void deleteTache(@PathParam("tacheId") String tacheId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Tache tache = tacheMapper.selectOne(tacheId);
        if (tache == null || !equipeMemberMapper.isMember(tache.equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        String equipeId = tache.equipeId;
        tacheMapper.deleteOne(tacheId);
        TacheWebSocket.broadcast(equipeId,
                "{\"type\":\"taskUpdated\",\"tacheId\":\"" + tacheId + "\",\"equipeId\":\"" + equipeId + "\"}");
    }

    @POST
    public void createTache(Tache tache) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!equipeMemberMapper.isMember(tache.equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        tache.id = UUID.randomUUID().toString();
        tache.dateCreation = new java.util.Date();
        tacheMapper.insertTache(tache);
        TacheWebSocket.broadcast(tache.equipeId,
                "{\"type\":\"taskUpdated\",\"tacheId\":\"" + tache.id + "\",\"equipeId\":\"" + tache.equipeId + "\"}");
    }

    @POST
    @Path("/set/{tacheId}")
    public void setTacheStatus(@PathParam("tacheId") String tacheId, @QueryParam("status") String status) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Tache tache = tacheMapper.selectOne(tacheId);
        if (tache == null || !equipeMemberMapper.isMember(tache.equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        tacheMapper.setStatus(tacheId, status);
        TacheWebSocket.broadcast(tache.equipeId,
                "{\"type\":\"taskUpdated\",\"tacheId\":\"" + tacheId + "\",\"equipeId\":\"" + tache.equipeId + "\"}");
    }

    @GET
    @Path("/nouveauID")
    public String getNewId() {
        return tacheMapper.getNewId();
    }

    @PUT
    @Path("/{tacheId}")
    public void updateTache(
            @PathParam("tacheId") String tacheId,
            @QueryParam("nomTache") String nomTache,
            @QueryParam("status") String status,
            @QueryParam("description") String description,
            @QueryParam("dateDebut") Date dateDebut,
            @QueryParam("dateFin") Date dateFin) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Tache tache = tacheMapper.selectOne(tacheId);
        if (tache == null || !equipeMemberMapper.isMember(tache.equipeId, cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        tacheMapper.updateTache(tacheId, nomTache, status, description, dateDebut, dateFin);
        tache = tacheMapper.selectOne(tacheId);
        if (tache != null) {
            TacheWebSocket.broadcast(tache.equipeId,
                    "{\"type\":\"taskUpdated\",\"tacheId\":\"" + tacheId + "\",\"equipeId\":\"" + tache.equipeId + "\"}");
            List<String> assignees = assigneeMapper.selectAssignees(tacheId);
            for (String assignee : assignees) {
                if (!assignee.equals(cipConnecte)) {
                    try {
                        notificationService.creerNotification(assignee, "taskUpdated", "La tâche '" + tache.nomTache + "' a été mise à jour.");
                    } catch (Exception e) {}
                }
            }
        }
    }
}