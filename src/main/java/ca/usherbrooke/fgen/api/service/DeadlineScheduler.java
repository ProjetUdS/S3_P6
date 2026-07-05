package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.AssigneeMapper;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class DeadlineScheduler {

    @Inject
    TacheMapper tacheMapper;

    @Inject
    AssigneeMapper assigneeMapper;

    @Inject
    TacheWebSocket tacheWebSocket;

    @Scheduled(cron = "0 0 8 * * ?")
    public void verifierDeadlines() {
        List<Tache> taches = tacheMapper.tachesAvecDeadlineDemain();

        for (Tache tache : taches) {
            List<String> assignes = assigneeMapper.selectAssignees(tache.id);

            String alerteJson = "{\"type\":\"deadlineAlert\",\"tacheId\":\"" + tache.id +
                    "\",\"nomTache\":\"" + tache.nomTache +
                    "\",\"dateFin\":\"" + tache.dateFin + "\"}";

            for (String cip : assignes) {
                tacheWebSocket.broadcast(tache.equipeId, alerteJson);
            }
        }
    }
}