package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Equipe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EquipeMapper {
  List<Equipe> select(
      @Param("usersCip") List<String> usersCip,
      @Param("equipeId") String equipeId,
      @Param("Administrateur") String Administrateur,
      @Param("nomEquipe") String nomEquipe);

  EquipeMapper selectOne(@Param("id") String id);
  void deleteOne(@Param("id") String id);
  void insertEquipe(@Param("equipe") Equipe equipe);
  String getNewId();
}
