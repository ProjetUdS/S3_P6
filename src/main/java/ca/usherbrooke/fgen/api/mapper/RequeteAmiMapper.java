package ca.usherbrooke.fgen.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RequeteAmiMapper {

    void insertRequete(@Param("cip") String cip, @Param("destinataireCip") String destinataireCip);

    void deleteRequete(@Param("cip") String cip, @Param("destinataireCip") String destinataireCip);

    List<String> selectRequetes(@Param("cip") String cip);

    List<String> selectRequetesEnvoyees(@Param("cip") String cip);
}