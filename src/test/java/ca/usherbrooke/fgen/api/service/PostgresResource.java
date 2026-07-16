package ca.usherbrooke.fgen.api.service;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.MountableFile;

import java.util.Map;

public class PostgresResource implements QuarkusTestResourceLifecycleManager {
    private static final PostgreSQLContainer<?> CONTAINER =
            new PostgreSQLContainer<>("postgres:13-alpine")
                    .withCopyFileToContainer(
                            MountableFile.forClasspathResource("01_init.sql"),
                            "/docker-entrypoint-initdb.d/01_init.sql"
                    );

    @Override
    public Map<String, String> start() {
        CONTAINER.start();
        return Map.of(
                "quarkus.datasource.jdbc.url", CONTAINER.getJdbcUrl(),
                "quarkus.datasource.username", CONTAINER.getUsername(),
                "quarkus.datasource.password", CONTAINER.getPassword()
        );
    }

    @Override
    public void stop() {
        CONTAINER.stop();
    }
}   