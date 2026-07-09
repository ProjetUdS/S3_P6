package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.FichierJoint;
import ca.usherbrooke.fgen.api.business.Message;
import ca.usherbrooke.fgen.api.mapper.FichierJointMapper;
import ca.usherbrooke.fgen.api.mapper.MessageMapper;

import jakarta.inject.Inject;
import org.jboss.logging.Logger;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;
import java.util.UUID;

@Path("/api/message")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MessageService {

    private static final Logger log = Logger.getLogger(MessageService.class);

    @Inject
    MessageMapper messageMapper;

    @Inject
    FichierJointMapper  fichierJointMapper;

    @GET
    public List<Message> getMessages(@QueryParam("discussionId") String discussionId, @QueryParam("limite") Integer limit, @QueryParam("decalage") Integer offset, @QueryParam("cip") String cip, @QueryParam("messageId") String messageId) {
        return messageMapper.select(discussionId, limit, offset, cip, messageId);
    }

    @GET
    @Path("/{messageId}")
    public Message getMessage(@PathParam("messageId") String messageId) {
        return messageMapper.selectOne(messageId);
    }

    @DELETE
    @Path("/{messageId}")
    public void deleteMessage(@PathParam("messageId") String messageId, @QueryParam("discussionId") String discussionId) {
        messageMapper.deleteOne(messageId, discussionId);
    }

    @POST
    public void sendMessage(Message message) {
        message.id = UUID.randomUUID().toString();
        message.date = new java.util.Date();
        messageMapper.insertMessage(message);

        if(message.fichiers != null && !message.fichiers.isEmpty()) {
            for (FichierJoint fichier:message.fichiers) {
                fichier.messageId = message.id;
                fichier.cip = message.cip;
                fichier.dateAjout = new java.util.Date();

                fichierJointMapper.insertFichier(fichier);
            }
            log.infof("Saved %d attached files for message %s", message.fichiers.size(), message.id);
        }
    }

    @GET
    @Path("/nouveauID")
    public String getNewId() {
        return messageMapper.getNewId();
    }

    @GET
    @Path("/friendDiscussions")
    public List<String> getFriendDiscussionIds(@QueryParam("cip") String cip) {
        return messageMapper.getFriendDiscussionIds(cip);
    }

    @GET
    @Path("/friendConversation")
    public List<Message> getFriendConversation(@QueryParam("cip1") String cip1, @QueryParam("cip2") String cip2, @QueryParam("limite") Integer limit, @QueryParam("decalage") Integer offset) {
        return messageMapper.getFriendConversation(cip1, cip2, limit, offset);
    }
}