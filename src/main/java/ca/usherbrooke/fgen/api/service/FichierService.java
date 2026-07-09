package ca.usherbrooke.fgen.api.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.InputStream;

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

    @GET
    @Path("/download-url/{fichierId: .+}")
    public MinioStorageService.PresignedUrlResponse getDownloadUrl(@PathParam("fichierId") String fichierId) {
        return minioStorageService.generateDownloadUrl(fichierId);
    }

    /**
     * Proxy download endpoint: streams the object from MinIO through the application
     * and sets a Content-Disposition header so browsers will download it. This
     * avoids cross-origin (CORS) issues when fetching presigned URLs directly from the browser.
     *
     * Usage: GET /api/fichiers/download-proxy/{fichierId}?filename=originalname.png
     */
    @GET
    @Path("/download-proxy/{fichierId: .+}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response downloadProxy(@PathParam("fichierId") String fichierId, @QueryParam("filename") String filename) {
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
