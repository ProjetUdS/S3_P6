import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import io.quarkus.test.junit.QuarkusTest;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.jupiter.api.Test;
import jakarta.inject.Inject;
import org.apache.ibatis.session.SqlSession;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DatabaseTest {

    @Test
    public void testInsertDatabase() {
            // Execute your MyBatis query
            TacheMapper mapper = mock(TacheMapper.class);
            Tache tache = new Tache();
            tache.id = "1234";
            tache.nomTache = "Faire Un Test";
            tache.status = "en cours";
            tache.description = "Je suis une description inutile";
            tache.dateCreation = new Date();
            tache.dateFin = new Date();
            tache.dateDebut = new Date();
            tache.equipeId = "4321";
            tache.cip = "belx8646";
            when(mapper.selectOne("1234")).thenReturn(tache);

            mapper.insertTache(tache);
            verify(mapper).insertTache(tache);
            var result = mapper.selectOne("1234");
            assert result != null;

    }
}