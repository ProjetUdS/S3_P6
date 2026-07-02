package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

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
        Date dateDebut = new Date();
        Date dateFin = new Date();

        doNothing().when(mapper).updateTache("1234", "Nouveau Nom", "terminé", "Nouvelle description", dateDebut, dateFin);
        mapper.updateTache("1234", "Nouveau Nom", "terminé", "Nouvelle description", dateDebut, dateFin);
        verify(mapper).updateTache("1234", "Nouveau Nom", "terminé", "Nouvelle description", dateDebut, dateFin);
    }
}