package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.mapper.EquipeMemberMapper;
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

@WebSocket(path = "/ws/tache/{equipeId}")
public class TacheWebSocket {
    private static final Logger LOG = Logger.getLogger(TacheWebSocket.class);
    private static final Map<String, ConnectionInfo> connections = new ConcurrentHashMap<>();
    private static final Map<WebSocketConnection, String> connectionToId = new ConcurrentHashMap<>();

    @Inject
    WebSocketAuthenticator authenticator;
    @Inject
    EquipeMemberMapper equipeMemberMapper;

    @OnOpen
    @Blocking
    public void onOpen(WebSocketConnection conn, HandshakeRequest request) {
        String cip = authenticator.verifyAndGetCip(WebSocketHelper.extractQueryParam(request.query(), "token"));
        String eqId = conn.pathParam("equipeId");
        if (cip == null || !equipeMemberMapper.isMember(eqId, cip)) {
            LOG.warn("WebSocket auth failed for tache endpoint");
            conn.close();
            return;
        }
        String id = UUID.randomUUID().toString();
        connections.put(id, new ConnectionInfo(conn, eqId));
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

    public static void broadcast(String equipeId, String tacheJson) {
        List<String> toRemove = new ArrayList<>();
        connections.forEach((id, info) -> {
            if (equipeId.equals(info.equipeId)) {
                try {
                    info.connection.sendTextAndAwait(tacheJson);
                } catch (Exception e) {
                    LOG.warnf("Failed to send WS message to equipe %s: %s",
                            info.equipeId, e.getMessage());
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
        final String equipeId;

        ConnectionInfo(WebSocketConnection connection, String equipeId) {
            this.connection = connection;
            this.equipeId = equipeId;
        }
    }
}
