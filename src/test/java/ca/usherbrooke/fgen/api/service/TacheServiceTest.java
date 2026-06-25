package ca.usherbrooke.fgen.api.service;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
class TacheServiceTest {

    @Test
    void createTache() {
        given()
                .contentType("application/json")
                .body("{\"nomTache\": \"Test\", \"status\": \"en cours\", \"equipeId\": \"4321\", \"cip\": \"belx8646\"}")
                .when().post("/api/tache")
                .then()
                .statusCode(204);
    }

    @Test
    void deleteTache() {
        given()
                .when().delete("/api/tache/1234")
                .then()
                .statusCode(204);
    }

    @Test
    void updateTache() {
        given()
                .queryParam("status", "terminé")
                .when().put("/api/tache/1234")
                .then()
                .statusCode(204);
    }
}