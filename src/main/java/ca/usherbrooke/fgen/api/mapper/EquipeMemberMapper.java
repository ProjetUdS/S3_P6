package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Equipe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EquipeMemberMapper {

  void insertMember(@Param("equipe") String equipId, @Param("membersCip")  String usersCip);

  String getNewId();
}
