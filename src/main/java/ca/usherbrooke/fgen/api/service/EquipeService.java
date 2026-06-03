package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;

import java.util.List;
import java.util.UUID;

@Path("/api/equipes")
@Produces({"application/json"})
public class EquipeService {

    @Inject
    EquipeMapper equipeMapper;

    @GET
    public List<Equipe> select(
            @QueryParam("usersCip") List<String> usersCip,
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

    @DELETE
    @Path("/{equipeId}")
    public String deleteOne(@PathParam("equipeId") String equipeId) {
        equipeMapper.deleteOne(equipeId);
        return equipeId;
    }

    @POST
    public String insertEquipe(Equipe equipe) {
        if (equipe.id == null) {
            equipe.id = UUID.randomUUID().toString().replace("-", "");
        }
        equipeMapper.insertEquipe(equipe);
        return equipe.id;
    }

    @GET
    @Path("/nouveauID")
    public String getNewId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}