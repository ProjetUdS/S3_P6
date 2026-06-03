import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import jakarta.inject.Inject;
import org.apache.ibatis.session.SqlSession;

import java.util.Date;

@QuarkusTest
public class DatabaseTest {

    @Inject
    SqlSession sqlSession;

    @Test
    public void testInsertDatabase() {
        // Execute your MyBatis query
        TacheMapper mapper = sqlSession.getMapper(TacheMapper.class);
        Tache tache = new Tache();
        tache.tache_id = "1234";
        tache.nom_tache = "Faire Un Test";
        tache.status = "en cours";
        tache.description = "Je suis une description inutile";
        tache.date_creation = new Date();
        tache.date_fin = new Date();
        tache.date_debut = new Date();
        tache.equipe_id = "4321";
        tache.cip = "belx8646";

        mapper.insertTache(tache);

        var result = mapper.selectOne(tache.tache_id);
        assert result != null;
    }
}