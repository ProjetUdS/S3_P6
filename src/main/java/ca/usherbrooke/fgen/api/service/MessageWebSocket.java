package ca.usherbrooke.fgen.api.service;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket(path = "/ws/message/{discussionId}")
public class MessageWebSocket {

    private static final Map<String, ConnectionInfo> connections = new ConcurrentHashMap<>();


    @OnOpen
    public void onOpen(WebSocketConnection conn) {
        String id = UUID.randomUUID().toString();
        String discId = conn.pathParam("discussionId");
        connections.put(id, new ConnectionInfo(conn, discId));
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
    }

    @OnTextMessage
    public void onMessage(String message) {}

    public static void broadcast(String discussionId, String messageJson) {
        connections.forEach((id, info) -> {
            if (discussionId.equals(info.discussionId)) {
                info.connection.sendText(messageJson).subscribe().with(
                        v -> {},
                        err -> connections.remove(id)
                );
            }
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