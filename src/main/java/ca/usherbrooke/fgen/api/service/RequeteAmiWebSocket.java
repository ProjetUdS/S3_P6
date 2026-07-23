package ca.usherbrooke.fgen.api.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.quarkus.websockets.next.*;
import org.jboss.logging.Logger;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket(path = "/ws/requeteAmi/{cip}")
public class RequeteAmiWebSocket {
    private static final Logger LOG = Logger.getLogger(RequeteAmiWebSocket.class);
    private static final Map<String, ConnectionInfo> connections = new ConcurrentHashMap<>();
    private static final Map<WebSocketConnection, String> connectionToId = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(WebSocketConnection conn, HandshakeRequest request) {
        String targetCip = conn.pathParam("cip");
        if (!validateToken(request, targetCip)) {
            LOG.warnf("WebSocket auth failed for requeteAmi cip=%s", targetCip);
            conn.close();
            return;
        }
        String id = UUID.randomUUID().toString();
        connections.put(id, new ConnectionInfo(conn, targetCip));
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

    private boolean validateToken(HandshakeRequest request, String expectedCip) {
        String token = extractQueryParam(request.query(), "token");
        if (token == null || token.isEmpty()) return false;
        String cip = decodeCipFromToken(token);
        return cip != null && expectedCip.equals(cip);
    }

    private static String decodeCipFromToken(String token) {
        try {
            String payload = token.split("\\.")[1];
            byte[] decoded = Base64.getUrlDecoder().decode(payload);
            ObjectNode node = (ObjectNode) JsonUtil.getMapper().readTree(decoded);
            return node.get("cip").asText();
        } catch (Exception e) {
            LOG.warnf("Failed to decode JWT: %s", e.getMessage());
            return null;
        }
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

    public static void broadcast(String cip, String requeteJson) {
        List<String> toRemove = new ArrayList<>();
        connections.forEach((id, info) -> {
            if (cip.equals(info.cip)) {
                try {
                    info.connection.sendTextAndAwait(requeteJson);
                } catch (Exception e) {
                    LOG.warnf("Failed to send WS message to %s: %s", info.cip, e.getMessage());
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
        final String cip;

        ConnectionInfo(WebSocketConnection connection, String cip) {
            this.connection = connection;
            this.cip = cip;
        }
    }
}
