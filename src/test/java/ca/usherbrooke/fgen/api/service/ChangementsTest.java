package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Discussion;
import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.*;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(PostgresResource.class)
class ChangementsTest {

    @Inject
    UtilisateurMapper utilisateurMapper;

    @Inject
    EquipeMapper equipeMapper;

    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @Inject
    DiscussionMapper discussionMapper;

    @Inject
    DiscussionMemberMapper discussionMemberMapper;

    @Inject
    TacheMapper tacheMapper;

    @Inject
    AssigneeMapper assigneeMapper;

    String cipAdmin;
    String cipMember;
    String cipBlocked;
    String cipOutside;
    String equipeId;
    String discussionId;
    String tacheId;

    @BeforeEach
    void setUp() {
        cipAdmin  = "test001";
        cipMember = "test002";
        cipBlocked = "test003";
        cipOutside = "test004";

        for (String cip : List.of(cipAdmin, cipMember, cipBlocked, cipOutside)) {
            utilisateurMapper.createUsager(cip, "user_" + cip, cip + "@test.com", "Nom" + cip, "Prenom" + cip, null);
        }

        discussionId = UUID.randomUUID().toString();
        Discussion discussion = new Discussion();
        discussion.discussionId = discussionId;
        discussionMapper.insertDiscussion(discussion);

        equipeId = UUID.randomUUID().toString();
        Equipe equipe = new Equipe();
        equipe.equipeId = equipeId;
        equipe.nomEquipe = "EquipeTest_" + UUID.randomUUID();
        equipe.administrateurCip = cipAdmin;
        equipe.discussionId = discussionId;
        equipeMapper.insertEquipe(equipe);

        equipeMemberMapper.insertMember(equipeId, cipAdmin);
        equipeMemberMapper.insertMember(equipeId, cipMember);

        discussionMemberMapper.insertMember(discussionId, cipAdmin);
        discussionMemberMapper.insertMember(discussionId, cipMember);

        tacheId = UUID.randomUUID().toString();
        Tache tache = new Tache();
        tache.id = tacheId;
        tache.nomTache = "TestTask";
        tache.status = "todo";
        tache.dateCreation = new Date();
        tache.dateDebut = new Date();
        tache.dateFin = new Date();
        tache.equipeId = equipeId;
        tache.cip = cipAdmin;
        tacheMapper.insertTache(tache);

        assigneeMapper.insertAssignee(tacheId, cipMember);
    }

    // ========== 1. INVITATION : tout membre peut inviter ==========

    @Test
    void toutMembrePeutInviter() {
        assertFalse(equipeMemberMapper.isMember(equipeId, cipOutside));
        equipeMemberMapper.insertMember(equipeId, cipOutside);
        assertTrue(equipeMemberMapper.isMember(equipeId, cipOutside));
    }

    // ========== 2. DÉPART : nettoie les assignations ==========

    @Test
    void departAdminTransfertAuPlusAncienMembre() {
        equipeMemberMapper.insertMember(equipeId, cipOutside);

        String nouveauAdmin = equipeMemberMapper.selectOldestMember(equipeId, cipAdmin);
        assertEquals(cipMember, nouveauAdmin);

        equipeMapper.updateAdministrateur(equipeId, nouveauAdmin);
        equipeMemberMapper.deleteMember(equipeId, cipAdmin);

        assertEquals(cipMember, equipeMapper.selectOne(equipeId).administrateurCip);
        assertFalse(equipeMemberMapper.isMember(equipeId, cipAdmin));
    }

    @Test
    void plusAncienMembreHorsEquipeExclu() {
        String nouveauAdmin = equipeMemberMapper.selectOldestMember(equipeId, cipMember);
        assertEquals(cipAdmin, nouveauAdmin);
    }

    @Test
    void departNettoieAssignations() {
        List<String> assignesAvant = assigneeMapper.selectAssignees(tacheId);
        assertTrue(assignesAvant.contains(cipMember));

        equipeMemberMapper.deleteMember(equipeId, cipMember);
        discussionMemberMapper.deleteMember(discussionId, cipMember);
        assigneeMapper.deleteAssigneesByTeamAndCip(equipeId, cipMember);

        List<String> assignesApres = assigneeMapper.selectAssignees(tacheId);
        assertFalse(assignesApres.contains(cipMember));
        assertFalse(equipeMemberMapper.isMember(equipeId, cipMember));
    }

    @Test
    void departNeSupprimePasLesAutresMembres() {
        assigneeMapper.insertAssignee(tacheId, cipAdmin);
        equipeMemberMapper.deleteMember(equipeId, cipMember);
        discussionMemberMapper.deleteMember(discussionId, cipMember);
        assigneeMapper.deleteAssigneesByTeamAndCip(equipeId, cipMember);

        assertTrue(equipeMemberMapper.isMember(equipeId, cipAdmin));
        List<String> assignes = assigneeMapper.selectAssignees(tacheId);
        assertTrue(assignes.contains(cipAdmin));
        assertFalse(assignes.contains(cipMember));
    }

    // ========== 3. DATES : mise à jour avec chaînes ISO ==========

    @Test
    void updateTacheDateAvecString() {
        tacheMapper.updateTache(tacheId, null, null, null, "2026-07-28", "2026-08-15");
        Tache modifiee = tacheMapper.selectOne(tacheId);
        assertNotNull(modifiee.dateDebut);
        assertNotNull(modifiee.dateFin);
    }

    @Test
    void updateTacheDateEffacement() {
        tacheMapper.updateTache(tacheId, null, null, null, "", "");
        Tache effacee = tacheMapper.selectOne(tacheId);
        assertNull(effacee.dateDebut);
        assertNull(effacee.dateFin);
    }

    @Test
    void updateTacheSansDateGardeAncienne() {
        Date oldStart = tacheMapper.selectOne(tacheId).dateDebut;
        tacheMapper.updateTache(tacheId, "Renamed", null, null, null, null);
        Tache modifiee = tacheMapper.selectOne(tacheId);
        assertEquals("Renamed", modifiee.nomTache);
        assertEquals(oldStart, modifiee.dateDebut);
    }

    // ========== 4. BLOCAGE : isUserBlocked ==========

    @Test
    void isUserBlockedVrai() {
        String privateDiscId = UUID.randomUUID().toString();
        Discussion privateDisc = new Discussion();
        privateDisc.discussionId = privateDiscId;
        discussionMapper.insertDiscussion(privateDisc);

        discussionMemberMapper.insertMember(privateDiscId, cipAdmin);
        discussionMemberMapper.insertMember(privateDiscId, cipBlocked);
        discussionMemberMapper.changeState(privateDiscId, cipAdmin, "blocked");

        assertTrue(discussionMemberMapper.isUserBlocked(cipAdmin, cipBlocked));
    }

    @Test
    void isUserBlockedFaux() {
        String privateDiscId = UUID.randomUUID().toString();
        Discussion privateDisc = new Discussion();
        privateDisc.discussionId = privateDiscId;
        discussionMapper.insertDiscussion(privateDisc);

        discussionMemberMapper.insertMember(privateDiscId, cipAdmin);
        discussionMemberMapper.insertMember(privateDiscId, cipMember);

        assertFalse(discussionMemberMapper.isUserBlocked(cipAdmin, cipMember));
        assertFalse(discussionMemberMapper.isUserBlocked(cipMember, cipAdmin));
    }

    @Test
    void isUserBlockedSansDiscussion() {
        assertFalse(discussionMemberMapper.isUserBlocked(cipAdmin, cipOutside));
    }

    @Test
    void isUserBlockedNonDansEquipe() {
        discussionMemberMapper.changeState(discussionId, cipAdmin, "blocked");
        assertFalse(discussionMemberMapper.isUserBlocked(cipAdmin, cipMember));
    }
}
