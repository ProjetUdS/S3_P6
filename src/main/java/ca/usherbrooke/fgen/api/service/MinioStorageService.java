package ca.usherbrooke.fgen.api.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@ApplicationScoped
public class MinioStorageService {
    private final MinioClient minioClient;
    private final String bucketName;

    public MinioStorageService(
            @ConfigProperty(name = "minio.url") String url,
            @ConfigProperty(name = "minio.access.key") String accessKey,
            @ConfigProperty(name = "minio.secret.key") String secretKey,
            @ConfigProperty(name = "minio.bucket.name") String bucketName) {
        this.bucketName = bucketName;
        this.minioClient = MinioClient.builder().endpoint(url).credentials(accessKey, secretKey).build();
    }

    public PresignedUrlResponse generateUploadUrl(String originalFilename) {
        try {
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String objectName = "files/" + UUID.randomUUID().toString() + extension;

            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder().
                    method(Method.PUT).
                    bucket(bucketName).
                    object(objectName).
                    expiry(15, TimeUnit.MINUTES).build()
            );

            return  new PresignedUrlResponse(objectName, presignedUrl);
        }catch (Exception e) {
            throw  new RuntimeException("Error generating upload url");
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
