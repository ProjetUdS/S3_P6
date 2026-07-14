package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Notification;
import ca.usherbrooke.fgen.api.mapper.NotificationMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Path("/api/notification")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class NotificationService {

    @Inject
    NotificationMapper notificationMapper;

    /**
     * Récupère les notifications d'un utilisateur, les plus récentes en premier.
     */
    @GET
    public List<Notification> getNotifications(@QueryParam("cip") String cip) {
        return notificationMapper.selectByCip(cip);
    }

    /**
     * Retourne le nombre de notifications non lues (pour le badge).
     */
    @GET
    @Path("/unread")
    public int getUnreadCount(@QueryParam("cip") String cip) {
        return notificationMapper.countUnread(cip);
    }

    /**
     * Marque une notification comme lue.
     */
    @POST
    @Path("/{notificationId}/read")
    public void markAsRead(@PathParam("notificationId") String notificationId) {
        notificationMapper.markAsRead(notificationId);
    }

    /**
     * Marque toutes les notifications d'un utilisateur comme lues.
     */
    @POST
    @Path("/read-all")
    public void markAllAsRead(@QueryParam("cip") String cip) {
        notificationMapper.markAllAsRead(cip);
    }

    /**
     * Crée une notification, la persiste et la pousse en temps réel via WebSocket.
     * Méthode réutilisable appelée par les autres services lors d'événements.
     *
     * @param cip     le destinataire
     * @param type    le type d'événement (taskAssigned, deadlineAlert, newMessage...)
     * @param contenu le texte affiché à l'utilisateur
     */
    public void creerNotification(String cip, String type, String contenu) {
        Notification notification = new Notification();
        notification.id = UUID.randomUUID().toString();
        notification.cip = cip;
        notification.type = type;
        notification.contenu = contenu;
        notification.lu = false;
        notification.dateCreation = new Date();

        notificationMapper.insertNotification(notification);

        NotificationWebSocket.broadcast(cip,
                "{\"type\":\"" + type + "\",\"contenu\":\"" + contenu + "\"}");
    }
}