package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.AssigneeMapper;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeadlineSchedulerTest {

    @Test
    void testTachesAvecDeadlineDemain() {
        TacheMapper tacheMapper = Mockito.mock(TacheMapper.class);
        AssigneeMapper assigneeMapper = Mockito.mock(AssigneeMapper.class);

        Tache tache = new Tache();
        tache.id = "1234";
        tache.nomTache = "Tâche urgente";
        tache.status = "en cours";
        tache.equipeId = "4321";
        tache.dateFin = new Date();

        when(tacheMapper.tachesAvecDeadlineDemain()).thenReturn(Arrays.asList(tache));
        when(assigneeMapper.selectAssignees("1234")).thenReturn(Arrays.asList("belx8646"));

        List<Tache> taches = tacheMapper.tachesAvecDeadlineDemain();
        assert taches != null;
        assert !taches.isEmpty();

        List<String> assignes = assigneeMapper.selectAssignees(taches.get(0).id);
        assert assignes != null;
        assert !assignes.isEmpty();

        verify(tacheMapper).tachesAvecDeadlineDemain();
        verify(assigneeMapper).selectAssignees("1234");
    }
}