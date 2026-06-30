package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.FichierJoint;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FichierJointMapper {
    void insertFichier(@Param("fichier") FichierJoint fichier);
}
