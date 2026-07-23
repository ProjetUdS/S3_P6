package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.record.TeamMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EquipeMemberMapper {

    void insertMember(@Param("equipeId") String equipeId, @Param("memberCip") String memberCip);

    void deleteMember(@Param("equipeId") String equipeId, @Param("memberCip") String memberCip);

    List<TeamMember> selectMembers(@Param("equipeId") String equipeId);

    boolean isMember(@Param("equipeId") String equipeId, @Param("cip") String cip);

    String getNewId();
}