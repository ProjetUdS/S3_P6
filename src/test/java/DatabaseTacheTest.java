import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DatabaseTacheTest {
    @Test
    public void testGetTachesByUser() {
            TacheMapper mapper = Mockito.mock(TacheMapper.class);
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
            mapper.insertTache(tache);
            verify(mapper).insertTache(tache);

            when(mapper.allTasksByUser("belx8646")).thenReturn(Arrays.asList(tache));
            var result = mapper.allTasksByUser("belx8646");
            assert result != null;
    }

    @Test
    public void testGetTachesByTeam() {
            TacheMapper mapper = Mockito.mock(TacheMapper.class);
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
            mapper.insertTache(tache);
            verify(mapper).insertTache(tache);

            when(mapper.allTasksByTeam("4321")).thenReturn(Arrays.asList(tache));
            var result = mapper.allTasksByTeam("4321");
            assert result != null;
    }

    @Test public void selectOneTache() {
            TacheMapper mapper = Mockito.mock(TacheMapper.class);
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
            mapper.insertTache(tache);
            verify(mapper).insertTache(tache);

            when(mapper.selectOne("1234")).thenReturn(tache);
            var result = mapper.selectOne("1234");
            assert result != null;
    }

    @Test
    public void deleteOneTache() {
            TacheMapper mapper = Mockito.mock(TacheMapper.class);
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
            mapper.insertTache(tache);
            verify(mapper).insertTache(tache);

            doNothing().when(mapper).deleteOne(tache.id);
            mapper.deleteOne(tache.id);
            verify(mapper).deleteOne(tache.id);
    }

    @Test
    public void testInsertTache() {
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

    @Test
    public void testDeadlines() {
            TacheMapper mapper = Mockito.mock(TacheMapper.class);
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
            mapper.insertTache(tache);
            verify(mapper).insertTache(tache);

            when(mapper.deadlines("4321")).thenReturn(Arrays.asList(tache));
            var result = mapper.deadlines("4321");
            assert result != null;
    }
}