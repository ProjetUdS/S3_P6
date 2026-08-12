package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {

    /**
     * Sélectionne les notifications d'un utilisateur, les plus récentes en premier.
     *
     * @param cip l'identifiant de l'utilisateur
     * @return la liste de ses notifications, triées par date décroissante
     */
    List<Notification> selectByCip(@Param("cip") String cip);

    /**
     * Compte les notifications non lues d'un utilisateur (pour le badge).
     *
     * @param cip l'identifiant de l'utilisateur
     * @return le nombre de notifications non lues
     */
    int countUnread(@Param("cip") String cip);

    /**
     * Insère une nouvelle notification.
     *
     * @param notification la notification à créer
     */
    void insertNotification(@Param("notification") Notification notification);

    /**
     * Marque une notification comme lue.
     *
     * @param notificationId l'identifiant de la notification
     * @param cip Cip à qui appartient la notification
     */
    void markAsRead(@Param("notificationId") String notificationId, @Param("cip") String cip);

    /**
     * Marque toutes les notifications d'un utilisateur comme lues.
     *
     * @param cip l'identifiant de l'utilisateur
     */
    void markAllAsRead(@Param("cip") String cip);

    /**
     * Supprime toutes les notifications d'un utilisateur.
     *
     * @param cip l'identifiant de l'utilisateur
     */
    void deleteAll(@Param("cip") String cip);
}
