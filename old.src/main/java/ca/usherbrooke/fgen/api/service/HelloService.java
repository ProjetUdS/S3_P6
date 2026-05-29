package ca.usherbrooke.fgen.api.service;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/public/hello")
public class
HelloService {

    @GET
    public String hello() {
        return "Hello RESTEasy Reactive";
    }
}
