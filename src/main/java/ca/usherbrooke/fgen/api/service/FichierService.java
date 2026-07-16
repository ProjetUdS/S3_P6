package ca.usherbrooke.fgen.api.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.InputStream;
import ca.usherbrooke.fgen.api.mapper.FichierJointMapper;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/api/fichiers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FichierService {
    @Inject
    MinioStorageService minioStorageService;

    @Inject
    JsonWebToken jwt;

    @Inject
    FichierJointMapper fichierJointMapper;

    @GET
    @Path("/upload-url")
    public MinioStorageService.PresignedUrlResponse getUploadUrl(@QueryParam("nomFichier") String nomFichier) {
        return minioStorageService.generateUploadUrl(nomFichier);
    }

    @GET
    @Path("/download-url/{fichierId: .+}")
    public MinioStorageService.PresignedUrlResponse getDownloadUrl(@PathParam("fichierId") String fichierId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Boolean isAllowed = fichierJointMapper.isUserAllowedToDownloadFichier(fichierId, cipConnecte);
        if (isAllowed == null || !isAllowed) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return minioStorageService.generateDownloadUrl(fichierId);
    }

    @GET
    @Path("/download-proxy/{fichierId: .+}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response downloadProxy(@PathParam("fichierId") String fichierId, @QueryParam("filename") String filename) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Boolean isAllowed = fichierJointMapper.isUserAllowedToDownloadFichier(fichierId, cipConnecte);
        if (isAllowed == null || !isAllowed) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        try {
            InputStream is = minioStorageService.getObjectStream(fichierId);
            String disposition = "attachment";
            if (filename != null && !filename.isEmpty()) {
                // sanitize filename minimally
                String safe = filename.replaceAll("[\"\\\\]", "_");
                disposition += "; filename=\"" + safe + "\"";
            }
            return Response.ok(is).header("Content-Disposition", disposition).build();
        } catch (Exception e) {
            throw new WebApplicationException("Failed to stream file: " + e.getMessage(), e);
        }
    }
}
