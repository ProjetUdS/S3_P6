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

    @Select("SELECT fj.fichier_id FROM app.fichier_joint fj " +
            "JOIN app.message m ON fj.message_id = m.message_id " +
            "WHERE m.discussion_id = #{discussionId}")
    List<String> selectFichierIdsByDiscussionId(@Param("discussionId") String discussionId);

    @Select("SELECT CASE " +
            "WHEN fj.cip = #{cip} THEN TRUE " +
            "WHEN EXISTS (SELECT 1 FROM app.equipe e JOIN app.est_dans ed ON e.equipe_id = ed.equipe_id WHERE e.discussion_id = m.discussion_id AND ed.cip = #{cip}) THEN TRUE " +
            "WHEN EXISTS (SELECT 1 FROM app.fait_parti fp WHERE fp.discussion_id = m.discussion_id AND fp.cip = #{cip}) THEN TRUE " +
            "ELSE FALSE END " +
            "FROM app.fichier_joint fj JOIN app.message m ON fj.message_id = m.message_id WHERE fj.fichier_id = #{fichierId}")
    Boolean isUserAllowedToDownloadFichier(@Param("fichierId") String fichierId, @Param("cip") String cip);
}
