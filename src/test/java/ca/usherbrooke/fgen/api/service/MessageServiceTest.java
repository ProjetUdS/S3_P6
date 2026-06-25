package ca.usherbrooke.fgen.api.service;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
class MessageServiceTest {

    @Test
    void sendMessage() {
        given()
                .contentType("application/json")
                .body("{\"contenu\": \"test\", \"cip\": \"belx8646\", \"discussionId\": \"67\"}")
                .when().post("/api/message")
                .then()
                .statusCode(204);
    }

    @Test
    void deleteMessage() {
        given()
                .queryParam("discussionId", "67")
                .when().delete("/api/message/69")
                .then()
                .statusCode(204);
    }
}