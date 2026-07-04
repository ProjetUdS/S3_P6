package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Tache;
import jakarta.ws.rs.QueryParam;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.time.LocalDate;

@Mapper
public interface TacheMapper {
  List<Tache> select(
      @Param("equipeId") String equipeId,
      @Param("usersID") List<String> usersId,
      @Param("dateCreation") Date dateCreation,
      @Param("nomTache") String nomTache);

  List<Tache> allTasksByTeam(@Param("equipeId") String equipeId);

  List<Tache> allTasksByUser(@Param("userId") String userId);

  /**
   * Sélectionne les tâches d'une équipe qui ont une date de fin définie,
   * triées par échéance croissante (date de fin la plus proche en premier).
   *
   * @param equipeId l'identifiant de l'équipe
   * @return la liste des tâches avec échéance, ordonnées par date de fin
   */
  List<Tache> deadlines(@Param("equipeId") String equipeId);

  List<Tache> tachesAvecDeadlineDemain();

  /**
   * Sélectionne les tâches d'une équipe dont la période [dateDebut, dateFin]
   * chevauche l'intervalle [dateMin, dateMax]. Les bornes nulles ne filtrent pas.
   *
   * @param equipeId l'identifiant de l'équipe
   * @param dateMin borne inférieure de l'intervalle, ou null
   * @param dateMax borne supérieure de l'intervalle, ou null
   * @return la liste des tâches chevauchant l'intervalle, triées par date de début
   */
  List<Tache> calendrierEquipe(@Param("equipeId") String equipeId,
                               @Param("dateMin") LocalDate dateMin,
                               @Param("dateMax") LocalDate dateMax);

  Tache selectOne(@Param("tacheId") String tacheId);

  void setStatus(@Param("tacheId") String tacheId, @Param("status") String status);

  void deleteOne(@Param("tacheId") String tacheId);

  void insertTache(@Param("tache") Tache tache);

    void updateTache(
            @Param("tacheId") String tacheId,
            @Param("nomTache") String nomTache,
            @Param("status") String status,
            @Param("description") String description,
            @Param("dateDebut") Date dateDebut,
            @Param("dateFin") Date dateFin);

  String getNewId();
}
