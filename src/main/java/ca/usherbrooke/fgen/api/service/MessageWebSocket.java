package ca.usherbrooke.fgen.api.service;

import io.quarkus.websockets.next.*;
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

    @OnOpen
    public void onOpen(WebSocketConnection conn, HandshakeRequest request) {
        if (!validateToken(request)) {
            LOG.warn("WebSocket auth failed for message endpoint");
            conn.close();
            return;
        }
        String id = UUID.randomUUID().toString();
        String discId = conn.pathParam("discussionId");
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

    private boolean validateToken(HandshakeRequest request) {
        String token = extractQueryParam(request.query(), "token");
        return token != null && !token.isEmpty();
    }

    private static String extractQueryParam(String query, String name) {
        if (query == null || query.isEmpty()) return null;
        for (String param : query.split("&")) {
            String[] parts = param.split("=", 2);
            if (parts.length == 2 && parts[0].equals(name)) {
                return URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }

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
