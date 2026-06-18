package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.mapper.RequeteAmiMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/requeteAmi")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RequeteAmiService {

    @Inject
    RequeteAmiMapper requeteAmiMapper;

    @GET
    public List<String> getRequetes(@QueryParam("cip") String cip) {
        return requeteAmiMapper.selectRequetes(cip);
    }

    @POST
    public String insertRequete(@QueryParam("cip") String cip, @QueryParam("destinataireCip") String destinataireCip) {
        requeteAmiMapper.insertRequete(cip, destinataireCip);
        return destinataireCip;
    }

    @DELETE
    public String deleteRequete(@QueryParam("cip") String cip, @QueryParam("destinataireCip") String destinataireCip) {
        requeteAmiMapper.deleteRequete(cip, destinataireCip);
        return destinataireCip;
    }
}