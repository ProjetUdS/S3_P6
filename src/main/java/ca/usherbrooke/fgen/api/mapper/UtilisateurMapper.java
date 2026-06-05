package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Utilisateur;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UtilisateurMapper {
    void createUsager(
            @Param("cip") String cip,
            @Param("pseudo") String pseudo,
            @Param("courriel") String courriel,
            @Param("nom") String nom,
            @Param("prenom") String prenom,
            @Param("photoProfilId") String photoProfilId);

    List<Utilisateur> select(
            @Param("cip") String cip,
            @Param("pseudo") String pseudo,
            @Param("courriel") String courriel,
            @Param("nom") String nom,
            @Param("prenom") String prenom);

    Utilisateur selectOne(
            @Param("cip") String cip, @Param("pseudo") String pseudo, @Param("courriel") String courriel);

    void deleteOne(@Param("cip") String cip);

    void insertContact(@Param("cip") String cip, @Param("cip_contact") String cip_contact);

    List<Utilisateur> getContacts(@Param("cip") String cip);
}
