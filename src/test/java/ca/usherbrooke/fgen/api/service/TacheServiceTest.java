package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TacheServiceTest {

    @Test
    void createTache() {
        TacheMapper mapper = Mockito.mock(TacheMapper.class);
        Tache tache = new Tache();
        tache.nomTache = "Test";
        tache.status = "en cours";
        tache.equipeId = "4321";
        tache.cip = "belx8646";

        doNothing().when(mapper).insertTache(tache);
        mapper.insertTache(tache);
        verify(mapper).insertTache(tache);
    }

    @Test
    void deleteTache() {
        TacheMapper mapper = Mockito.mock(TacheMapper.class);

        doNothing().when(mapper).deleteOne("1234");
        mapper.deleteOne("1234");
        verify(mapper).deleteOne("1234");
    }

    @Test
    void updateTache() {
        TacheMapper mapper = Mockito.mock(TacheMapper.class);

        doNothing().when(mapper).updateTache("1234", "Nouveau Nom", "terminé", "Nouvelle description", "2026-07-28", "2026-08-15");
        mapper.updateTache("1234", "Nouveau Nom", "terminé", "Nouvelle description", "2026-07-28", "2026-08-15");
        verify(mapper).updateTache("1234", "Nouveau Nom", "terminé", "Nouvelle description", "2026-07-28", "2026-08-15");
    }
}