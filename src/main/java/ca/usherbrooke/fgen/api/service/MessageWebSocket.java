package ca.usherbrooke.fgen.api.service;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket(path = "/ws/message/{discussionId}")
public class MessageWebSocket {

    private static final Logger log = Logger.getLogger(MessageWebSocket.class);
    private static final Map<String, ConnectionInfo> connections = new ConcurrentHashMap<>();


    @OnOpen
    public void onOpen(WebSocketConnection conn) {
        String id = UUID.randomUUID().toString();
        String discId = conn.pathParam("discussionId");
        connections.put(id, new ConnectionInfo(conn, discId));
        log.infof("WS OPEN: id=%s discussionId=%s total=%d", id, discId, connections.size());
    }

    @OnClose
    public void onClose(WebSocketConnection conn) {
        String removeId = null;
        for (Map.Entry<String, ConnectionInfo> entry : connections.entrySet()) {
            if (entry.getValue().connection == conn) {
                removeId = entry.getKey();
                break;
            }
        }
        if (removeId != null) {
            connections.remove(removeId);
        }
        log.infof("WS CLOSE: removed=%s total=%d", removeId, connections.size());
    }

    @OnTextMessage
    public void onMessage(String message) {}

    public static void broadcast(String discussionId, String messageJson) {
        log.infof("WS BROADCAST: discussionId=%s connections=%d", discussionId, connections.size());
        List<String> toRemove = new ArrayList<>();
        connections.forEach((id, info) -> {
            try {
                if (discussionId.equals(info.discussionId)) {
                    log.infof("WS SEND: id=%s discussionId=%s", id, discussionId);
                    info.connection.sendTextAndAwait(messageJson);
                } else {
                    log.infof("WS SKIP: id=%s has=%s want=%s", id, info.discussionId, discussionId);
                }
            } catch (Exception e) {
                toRemove.add(id);
            }
        });
        toRemove.forEach(connections::remove);
    }

    private static class ConnectionInfo {
        final WebSocketConnection connection;
        final String discussionId;

        ConnectionInfo(WebSocketConnection connection, String discussionId) {
            this.connection = connection;
            this.discussionId = discussionId;
        }
    }
}