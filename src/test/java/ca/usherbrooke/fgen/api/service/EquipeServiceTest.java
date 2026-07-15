package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.DiscussionMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.mapper.UtilisateurMapper;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(PostgresResource.class) // Starts the test DB
class EquipeServiceTest {

    @Inject
    UtilisateurMapper utilisateurMapper;

    @Inject
    EquipeMapper equipeMapper;

    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @Inject
    DiscussionMapper discussionMapper;

    @Test
    void testCreateUsersAndGetTeam() {
        // 1. Create 3 users
        String cip1 = "abc0001";
        String cip2 = "abc0002";
        String cip3 = "abc0003";

        utilisateurMapper.createUsager(cip1, "user1", "user1@test.com", "Nom1", "Prenom1", null);
        utilisateurMapper.createUsager(cip2, "user2", "user2@test.com", "Nom2", "Prenom2", null);
        utilisateurMapper.createUsager(cip3, "user3", "user3@test.com", "Nom3", "Prenom3", null);

        // 2. Make a team (equipe) with 2 users (user1 and user2)
        // A discussion is required as a foreign key constraint for an Equipe
        Discussion discussion = new Discussion();
        discussion.discussionId = UUID.randomUUID().toString();
        discussionMapper.insertDiscussion(discussion);

        // Instantiate and insert the Equipe
        Equipe equipe = new Equipe();
        equipe.equipeId = UUID.randomUUID().toString();
        equipe.nomEquipe = "Equipe 2 Users";
        equipe.administrateurCip = cip1;
        equipe.discussionId = discussion.discussionId;
        equipeMapper.insertEquipe(equipe);

        // Add user1 and user2 as team members
        equipeMemberMapper.insertMember(equipe.equipeId, cip1);
        equipeMemberMapper.insertMember(equipe.equipeId, cip2);

        // 3. Try to get teams for user3 (should return an empty list)
        List<Equipe> equipesUser3 = equipeMapper.select(new String[]{cip3}, null, null, null);
        assertTrue(equipesUser3.isEmpty(), "User 3 should not belong to any team");

        // 4. Verify that user1 is indeed in the team
        List<Equipe> equipesUser1 = equipeMapper.select(new String[]{cip1}, null, null, null);
        assertEquals(1, equipesUser1.size(), "User 1 should be in 1 team");
        assertEquals(equipe.equipeId, equipesUser1.getFirst().equipeId, "The team ID should match");
    }
}