package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.FichierJoint;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FichierJointMapper {
    void insertFichier(@Param("fichier") FichierJoint fichier);

    @Select("SELECT fichier_id as fichierId, message_id as messageId, cip, nom_original as nomOriginal, type_mime as typeMime, taille_octets as tailleOctets, date_ajout as dateAjout FROM app.fichier_joint WHERE message_id = #{messageId}")
    List<FichierJoint> selectByMessageId(@Param("messageId") String messageId);
}
