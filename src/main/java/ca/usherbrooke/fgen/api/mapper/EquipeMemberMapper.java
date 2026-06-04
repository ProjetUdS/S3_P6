package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Equipe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EquipeMemberMapper {

  void insertMember(@Param("equipeId") String equipeId, @Param("memberCip")  String memberCip);

  String getNewId();
}
