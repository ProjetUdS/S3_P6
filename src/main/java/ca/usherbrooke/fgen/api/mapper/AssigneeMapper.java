package ca.usherbrooke.fgen.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AssigneeMapper {

    void insertAssignee(@Param("tacheId") String tacheId, @Param("cip") String cip);

    void deleteAssignee(@Param("tacheId") String tacheId, @Param("cip") String cip);

    void deleteAssigneesByTeamAndCip(@Param("equipeId") String equipeId, @Param("cip") String cip);

    List<String> selectAssignees(@Param("tacheId") String tacheId);
}