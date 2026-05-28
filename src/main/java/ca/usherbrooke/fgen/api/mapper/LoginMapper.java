package ca.usherbrooke.fgen.api.mapper;


import ca.usherbrooke.fgen.api.business.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LoginMapper {
    void createUsager(@Param("pseudo") String pseudo,
                      @Param("courriel") String courriel,
                      @Param("nom") String nom,
                      @Param("prenom") String prenom,
                      @Param("photo_profil_id") String photo_profil_id);
}
