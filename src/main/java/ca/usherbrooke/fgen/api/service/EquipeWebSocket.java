package ca.usherbrooke.fgen.api.service;

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

@WebSocket(path = "/ws/equipe/{cip}")
public class EquipeWebSocket {
    private static final Logger LOG = Logger.getLogger(EquipeWebSocket.class);
    private static final Map<String, ConnectionInfo> connections = new ConcurrentHashMap<>();
    private static final Map<WebSocketConnection, String> connectionToId = new ConcurrentHashMap<>();

    @Inject
    WebSocketAuthenticator authenticator;

    @OnOpen
    @Blocking
    public void onOpen(WebSocketConnection conn, HandshakeRequest request) {
        String targetCip = conn.pathParam("cip");
        String cip = authenticator.verifyAndGetCip(WebSocketHelper.extractQueryParam(request.query(), "token"));
        if (cip == null || !cip.equals(targetCip)) {
            LOG.warnf("WebSocket auth failed for cip=%s", targetCip);
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
