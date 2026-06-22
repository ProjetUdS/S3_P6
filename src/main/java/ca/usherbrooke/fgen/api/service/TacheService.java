package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

@Path("/api/tache")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TacheService {

  @Inject TacheMapper tacheMapper;

    @GET
    public List<Tache> getTaches(
            @QueryParam("equipeId") String equipeId,
            @QueryParam("usersID") List<String> usersId,
            @QueryParam("dateCreation") Date dateCreation,
            @QueryParam("nomTache") String nomTache) {
        return tacheMapper.select(equipeId, usersId, dateCreation, nomTache);
    }

    /**
     * Récupère les tâches d'une équipe qui chevauchent une plage de dates donnée,
     * pour un affichage de type calendrier.
     *
     * @param equipeId l'identifiant de l'équipe
     * @param dateMin borne inférieure de la plage (peut être nulle pour ne pas filtrer)
     * @param dateMax borne supérieure de la plage (peut être nulle pour ne pas filtrer)
     * @return la liste des tâches de l'équipe dont la période recoupe l'intervalle demandé
     */
    @GET
    @Path("/calendrier")
    public List<Tache> getCalendrier(@QueryParam("equipeId") String equipeId,
                                     @QueryParam("dateMin") LocalDate dateMin,
                                     @QueryParam("dateMax") LocalDate dateMax) {
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
        tacheMapper.deleteOne(tacheId);
    }

    @POST
    public void createTache(Tache tache) {
        tache.id = UUID.randomUUID().toString();
        tache.dateCreation = new java.util.Date();
        tacheMapper.insertTache(tache);
    }

    @POST
    @Path("/set/{tacheId}")
    public void setTacheStatus(@PathParam("tacheId") String tacheId, @QueryParam("status") String status) {
        Tache tache = tacheMapper.selectOne(tacheId);
        if(tache == null) {
            return;
        }
        tacheMapper.setStatus(tacheId, status);
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
        tacheMapper.updateTache(tacheId, nomTache, status, description, dateDebut, dateFin);
    }
}
