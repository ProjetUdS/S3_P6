package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Tache;
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

  List<Tache> calendrierEquipe(@Param("equipeId") String equipeId,
                               @Param("dateMin") LocalDate dateMin,
                               @Param("dateMax") LocalDate dateMax);

  Tache selectOne(@Param("tacheId") String tacheId);

  void deleteOne(@Param("tacheId") String tacheId);

  void insertTache(@Param("tache") Tache tache);

  String getNewId();
}
