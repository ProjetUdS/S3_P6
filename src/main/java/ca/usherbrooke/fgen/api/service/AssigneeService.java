package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.mapper.AssigneeMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/assignee")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssigneeService {

    @Inject
    AssigneeMapper assigneeMapper;

    @GET
    @Path("/{tacheId}")
    public List<String> getAssignees(@PathParam("tacheId") String tacheId) {
        return assigneeMapper.selectAssignees(tacheId);
    }

    @POST
    @Path("/{tacheId}")
    public String insertAssignee(@PathParam("tacheId") String tacheId, @QueryParam("cip") String cip) {
        assigneeMapper.insertAssignee(tacheId, cip);
        return cip;
    }

    @DELETE
    @Path("/{tacheId}")
    public String deleteAssignee(@PathParam("tacheId") String tacheId, @QueryParam("cip") String cip) {
        assigneeMapper.deleteAssignee(tacheId, cip);
        return cip;
    }
}
