package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.EstDans;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EstDansMapper {

    List<EstDans> select(
            @Param("cip") String cip,
            @Param("equipeId") String equipeId);

    void insertEstDans(@Param("estDans") EstDans estDans);

    void deleteOne(
            @Param("cip") String cip,
            @Param("equipeId") String equipeId);
}
