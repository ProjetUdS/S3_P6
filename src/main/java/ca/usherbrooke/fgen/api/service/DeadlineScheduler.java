package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Tache;
import ca.usherbrooke.fgen.api.mapper.AssigneeMapper;
import ca.usherbrooke.fgen.api.mapper.TacheMapper;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Map;

@ApplicationScoped
public class DeadlineScheduler {
    private static final Logger LOG = Logger.getLogger(DeadlineScheduler.class);

    @Inject
    TacheMapper tacheMapper;

    @Inject
    AssigneeMapper assigneeMapper;

    @Inject
    NotificationService notificationService;

    @Scheduled(cron = "0 0 8 * * ?")
    public void verifierDeadlines() {
        List<Tache> taches = tacheMapper.tachesAvecDeadlineDemain();

        for (Tache tache : taches) {
            List<String> assignes = assigneeMapper.selectAssignees(tache.id);

            String alerteJson = JsonUtil.toJson(Map.of(
                    "type", "deadlineAlert",
                    "tacheId", tache.id,
                    "nomTache", tache.nomTache != null ? tache.nomTache : "",
                    "dateFin", tache.dateFin != null ? tache.dateFin.toString() : ""
            ));

            TacheWebSocket.broadcast(tache.equipeId, alerteJson);

            for (String cip : assignes) {
                try {
                    notificationService.creerNotification(cip, "deadlineAlert",
                            "La tâche '" + tache.nomTache + "' est due demain !");
                } catch (Exception e) {
                    LOG.errorf(e, "Failed to send deadline notification to %s for tache %s", cip, tache.id);
                }
            }
        }
    }
}
