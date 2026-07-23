package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.mapper.ContactMapper;
import ca.usherbrooke.fgen.api.mapper.RequeteAmiMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api/requeteAmi")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RequeteAmiService {

    @Inject
    RequeteAmiMapper requeteAmiMapper;

    @Inject
    ContactMapper contactMapper;

    @Inject
    JsonWebToken jwt;

    @GET
    public List<String> getRequetes(@QueryParam("cip") String cip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return requeteAmiMapper.selectRequetes(cip);
    }

    @GET
    @Path("/envoyees")
    public List<String> getRequetesEnvoyees(@QueryParam("cip") String cip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return requeteAmiMapper.selectRequetesEnvoyees(cip);
    }

    @POST
    public String insertRequete(@QueryParam("cip") String cip, @QueryParam("destinataireCip") String destinataireCip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        requeteAmiMapper.insertRequete(cip, destinataireCip);
        RequeteAmiWebSocket.broadcast(destinataireCip,
                "{\"type\":\"friendRequest\",\"de\":\"" + cip + "\",\"a\":\"" + destinataireCip + "\"}");
        return destinataireCip;
    }

    @POST
    @Path("/accepter")
    public String accepterRequete(@QueryParam("cip") String cip, @QueryParam("destinataireCip") String destinataireCip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        contactMapper.insertContact(cip, destinataireCip);
        contactMapper.insertContact(destinataireCip, cip);
        RequeteAmiWebSocket.broadcast(destinataireCip, "{\"type\":\"friendAccept\",\"de\":\"" + cip + "\",\"a\":\"" + destinataireCip + "\"}");
        requeteAmiMapper.deleteRequete(destinataireCip, cip);
        requeteAmiMapper.deleteRequete(cip,destinataireCip);
        return destinataireCip;
    }

    @POST
    @Path("/refuser")
    public String refuserRequete(@QueryParam("cip") String cip, @QueryParam("destinataireCip") String destinataireCip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        requeteAmiMapper.deleteRequete(destinataireCip, cip);
        return destinataireCip;
    }

    @DELETE
    public String deleteRequete(@QueryParam("cip") String cip, @QueryParam("destinataireCip") String destinataireCip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        requeteAmiMapper.deleteRequete(cip, destinataireCip);
        return destinataireCip;
    }
}