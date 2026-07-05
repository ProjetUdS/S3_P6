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
class TacheWebSocketTest {

    @Test
    void testUpdateTache() {
        TacheMapper mapper = Mockito.mock(TacheMapper.class);
        Date dateDebut = new Date();
        Date dateFin = new Date();

        doNothing().when(mapper).updateTache("1234", "Nouveau Nom", "terminé", "Description", dateDebut, dateFin);
        mapper.updateTache("1234", "Nouveau Nom", "terminé", "Description", dateDebut, dateFin);
        verify(mapper).updateTache("1234", "Nouveau Nom", "terminé", "Description", dateDebut, dateFin);
    }
}