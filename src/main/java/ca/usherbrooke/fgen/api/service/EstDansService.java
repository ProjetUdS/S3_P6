package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.EstDans;
import ca.usherbrooke.fgen.api.mapper.EstDansMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/est-dans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EstDansService {

    @Inject EstDansMapper estDansMapper;

    @GET
    public List<EstDans> select(
            @QueryParam("cip") String cip,
            @QueryParam("equipeId") String equipeId) {
        return estDansMapper.select(cip, equipeId);
    }

    @POST
    public void rejoindreEquipe(EstDans estDans) {
        estDansMapper.insertEstDans(estDans);
    }

    @DELETE
    public void quitterEquipe(
            @QueryParam("cip") String cip,
            @QueryParam("equipeId") String equipeId) {
        estDansMapper.deleteOne(cip, equipeId);
    }
}
