package ca.usherbrooke.fgen.api.service;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import io.quarkus.runtime.StartupEvent;
import io.minio.RemoveObjectArgs;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Optional;
import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@ApplicationScoped
public class MinioStorageService {
    private static final Logger log = Logger.getLogger(MinioStorageService.class);
    private final MinioClient minioClient;
    private final String bucketName;
    private final String minioUrl;
    private final String minioBrowserUrl;
    private volatile boolean minioAvailable = false;

    public MinioStorageService(
            @ConfigProperty(name = "minio.url") String url,
            @ConfigProperty(name = "minio.access.key") String accessKey,
            @ConfigProperty(name = "minio.secret.key") String secretKey,
            @ConfigProperty(name = "minio.bucket.name") String bucketName,
            @ConfigProperty(name = "minio.browser.url") Optional<String> browserUrl) {
        this.bucketName = bucketName;
        this.minioUrl = url;
        this.minioBrowserUrl = browserUrl.orElse(url);
        this.minioClient = MinioClient.builder().endpoint(url).credentials(accessKey, secretKey).build();
    }

    void onStart(@Observes StartupEvent ev) {
        log.infof("Initializing MinIO. Attempting to create bucket: %s", bucketName);
        try {
            // Check if bucket exists, create if it doesn't
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                log.infof("Bucket does not exist, creating bucket: %s", bucketName);
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.infof("Successfully created bucket: %s", bucketName);
            } else {
                log.infof("Bucket already exists: %s", bucketName);
            }
            minioAvailable = true;
        } catch (Exception e) {
            log.errorf(e, "Failed to initialize MinIO bucket: %s. MinIO will be disabled until it becomes reachable.", bucketName);
            // Do not fail startup if MinIO is temporarily unavailable; keep the application running.
            minioAvailable = false;
        }
    }

    public PresignedUrlResponse generateUploadUrl(String originalFilename) {
        if (!minioAvailable) {
            throw new RuntimeException("MinIO is not available");
        }
        try {
            // Extract file extension safely, default to empty if no extension
            String extension = "";
            int lastDot = originalFilename.lastIndexOf(".");
            if (lastDot > 0 && lastDot < originalFilename.length() - 1) {
                extension = originalFilename.substring(lastDot);
            }
            String objectName = "files/" + UUID.randomUUID() + extension;

            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder().
                    method(Method.PUT).
                    bucket(bucketName).
                    object(objectName).
                    expiry(15, TimeUnit.MINUTES).build()
            );

            // If browser URL is different from internal URL, rewrite the presigned URL
            if (!minioUrl.equals(minioBrowserUrl)) {
                presignedUrl = presignedUrl.replace(minioUrl, minioBrowserUrl);
                log.infof("Rewrote presigned URL from %s to %s", minioUrl, minioBrowserUrl);
            }

            return  new PresignedUrlResponse(objectName, presignedUrl);
        }catch (Exception e) {
            log.errorf("Error generating upload url for file: %s. Bucket: %s. Exception: %s", originalFilename, bucketName, e.getMessage());
            log.error("Full stacktrace: ", e);
            throw  new RuntimeException("Error generating upload url: " + e.getMessage(), e);
        }
    }

    public PresignedUrlResponse generateDownloadUrl(String fichierId) {
        if (!minioAvailable) {
            throw new RuntimeException("MinIO is not available");
        }
        try {
            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder().
                    method(Method.GET).
                    bucket(bucketName).
                    object(fichierId).
                    expiry(15, TimeUnit.MINUTES).build()
            );

            // If browser URL is different from internal URL, rewrite the presigned URL
            if (!minioUrl.equals(minioBrowserUrl)) {
                presignedUrl = presignedUrl.replace(minioUrl, minioBrowserUrl);
                log.infof("Rewrote download presigned URL from %s to %s", minioUrl, minioBrowserUrl);
            }

            return  new PresignedUrlResponse(fichierId, presignedUrl);
        }catch (Exception e) {
            log.errorf("Error generating download url for fichier: %s. Bucket: %s. Exception: %s", fichierId, bucketName, e.getMessage());
            log.error("Full stacktrace: ", e);
            throw  new RuntimeException("Error generating download url: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieve the object as an InputStream so it can be proxied by the application
     * (useful to avoid CORS issues by streaming through the backend and setting
     * Content-Disposition headers).
     */
    public InputStream getObjectStream(String fichierId) throws Exception {
        if (!minioAvailable) {
            throw new RuntimeException("MinIO is not available");
        }
        return minioClient.getObject(
                io.minio.GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fichierId)
                        .build()
        );
    }

    public void removeObject(String fichierId) {
        if (!minioAvailable || fichierId == null) {
            return;
        }
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fichierId)
                            .build()
            );
        } catch (Exception e) {
            // Non bloquant : un objet orphelin dans MinIO n'est pas critique
            log.warnf("Failed to remove object %s from bucket %s: %s", fichierId, bucketName, e.getMessage());
        }
    }

    public static class PresignedUrlResponse {
        public String fichierId;
        public String uploadUrl;

        public PresignedUrlResponse(String fichierId, String uploadUrl) {
            this.fichierId = fichierId;
            this.uploadUrl = uploadUrl;
        }
    }
}
