package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.mapper.ContactMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/contact")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContactService {

    @Inject
    ContactMapper contactMapper;

    @GET
    public List<String> getContacts(@QueryParam("cip") String cip) {
        return contactMapper.selectContacts(cip);
    }

    @POST
    public String insertContact(@QueryParam("cip") String cip, @QueryParam("cipContact") String cipContact) {
        contactMapper.insertContact(cip, cipContact);
        return cipContact;
    }

    @DELETE
    public String deleteContact(@QueryParam("cip") String cip, @QueryParam("cipContact") String cipContact) {
        contactMapper.deleteContact(cip, cipContact);
        return cipContact;
    }
}