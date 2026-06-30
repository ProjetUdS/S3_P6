package ca.usherbrooke.fgen.api.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/api/fichiers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FichierService {
    @Inject
    MinioStorageService minioStorageService;

    @GET
    @Path("/upload-url")
    public MinioStorageService.PresignedUrlResponse getUploadUrl(@QueryParam("nomFichier") String nomFichier) {
        return minioStorageService.generateUploadUrl(nomFichier);
    }
}
