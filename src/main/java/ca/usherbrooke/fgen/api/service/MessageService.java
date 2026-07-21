package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.FichierJoint;
import ca.usherbrooke.fgen.api.business.Message;
import ca.usherbrooke.fgen.api.mapper.ContactMapper;
import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import ca.usherbrooke.fgen.api.mapper.FichierJointMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
import ca.usherbrooke.fgen.api.mapper.MessageMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

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
    FichierJointMapper fichierJointMapper;

    @Inject
    ContactMapper contactMapper;

    @Inject
    DiscussionMemberMapper discussionMemberMapper;

    @Inject
    EquipeMapper equipeMapper;

    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @Inject
    JsonWebToken jwt;

    @GET
    public List<Message> getMessages(
            @QueryParam("discussionId") String discussionId,
            @QueryParam("limite") Integer limit,
            @QueryParam("decalage") Integer offset,
            @QueryParam("cip") String cip,
            @QueryParam("messageId") String messageId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (cip != null && !cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        if (discussionId != null) {
            ensureDiscussionAccess(discussionId, cipConnecte);
        }
        return messageMapper.select(discussionId, limit, offset, cip, messageId);
    }

    @GET
    @Path("/{messageId}")
    public Message getMessage(@PathParam("messageId") String messageId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Message message = messageMapper.selectOne(messageId);
        if (message == null || !message.cip.equals(cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return message;
    }

    @DELETE
    @Path("/{messageId}")
    public void deleteMessage(@PathParam("messageId") String messageId, @QueryParam("discussionId") String discussionId) {
        String cipConnecte = (String) jwt.getClaim("cip");
        Message message = messageMapper.selectOne(messageId);
        if (message == null || !message.cip.equals(cipConnecte)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        messageMapper.deleteOne(messageId, discussionId);
    }

    @POST
    public void sendMessage(Message message) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(message.cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        ensureDiscussionAccess(message.discussionId, message.cip);
        message.id = UUID.randomUUID().toString();
        message.date = new java.util.Date();
        messageMapper.insertMessage(message);
        MessageWebSocket.broadcast(message.discussionId,
                "{\"type\":\"messageReceived\",\"messageId\":\"" + message.id + "\",\"discussionId\":\"" + message.discussionId + "\"}");
        if (message.fichiers != null && !message.fichiers.isEmpty()) {
            for (FichierJoint fichier : message.fichiers) {
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
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return messageMapper.getFriendDiscussionIds(cip);
    }

    @GET
    @Path("/friendConversation")
    public List<Message> getFriendConversation(
            @QueryParam("cip1") String cip1,
            @QueryParam("cip2") String cip2,
            @QueryParam("limite") Integer limit,
            @QueryParam("decalage") Integer offset) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip1) || !contactMapper.isContact(cip1, cip2)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return messageMapper.getFriendConversation(cip1, cip2, limit, offset);
    }

    private void ensureDiscussionAccess(String discussionId, String cip) {
        if (discussionMemberMapper.isDiscussionParticipant(discussionId, cip)) return;
        String equipeId = equipeMapper.selectEquipeIdByDiscussionId(discussionId);
        if (equipeId == null || !equipeMemberMapper.isMember(equipeId, cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        discussionMemberMapper.insertMember(discussionId, cip);
    }
}