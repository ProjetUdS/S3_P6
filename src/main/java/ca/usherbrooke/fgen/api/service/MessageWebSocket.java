package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.mapper.DiscussionMemberMapper;
import io.quarkus.websockets.next.*;
import io.smallrye.common.annotation.Blocking;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket(path = "/ws/message/{discussionId}")
public class MessageWebSocket {
    private static final Logger LOG = Logger.getLogger(MessageWebSocket.class);
    private static final Map<String, ConnectionInfo> connections = new ConcurrentHashMap<>();
    private static final Map<WebSocketConnection, String> connectionToId = new ConcurrentHashMap<>();

    @Inject
    WebSocketAuthenticator authenticator;
    @Inject
    DiscussionMemberMapper discussionMemberMapper;


    @OnOpen
    @Blocking
    public void onOpen(WebSocketConnection conn, HandshakeRequest request) {
        String cip = authenticator.verifyAndGetCip(WebSocketHelper.extractQueryParam(request.query(), "token"));
        String discId = conn.pathParam("discussionId");
        if (cip == null || !discussionMemberMapper.isDiscussionParticipant(discId, cip)) {
            LOG.warn("WebSocket auth failed for message endpoint");
            conn.close();
            return;
        }
        String id = UUID.randomUUID().toString();
        connections.put(id, new ConnectionInfo(conn, discId));
        connectionToId.put(conn, id);
    }

    @OnClose
    public void onClose(WebSocketConnection conn) {
        String id = connectionToId.remove(conn);
        if (id != null) {
            connections.remove(id);
        }
    }

    @OnTextMessage
    public void onMessage(String message) {}


    public static void broadcast(String discussionId, String messageJson) {
        List<String> toRemove = new ArrayList<>();
        connections.forEach((id, info) -> {
            if (discussionId.equals(info.discussionId)) {
                try {
                    info.connection.sendTextAndAwait(messageJson);
                } catch (Exception e) {
                    LOG.warnf("Failed to send WS message to discussion %s: %s", info.discussionId, e.getMessage());
                    toRemove.add(id);
                }
            }
        });
        toRemove.forEach(id -> {
            ConnectionInfo info = connections.remove(id);
            if (info != null) connectionToId.remove(info.connection);
        });
    }

    static class ConnectionInfo {
        final WebSocketConnection connection;
        final String discussionId;

        ConnectionInfo(WebSocketConnection connection, String discussionId) {
            this.connection = connection;
            this.discussionId = discussionId;
        }
    }
}
