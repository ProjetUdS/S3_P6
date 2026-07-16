package ca.usherbrooke.fgen.api.service;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket(path = "/ws/message/{discussionId}")
public class MessageWebSocket {

    private static final Map<String, WebSocketConnection> connections = new ConcurrentHashMap<>();

    @Inject
    WebSocketConnection connection;

    @OnOpen
    public void onOpen() {
        String id = connection.id();
        connections.put(id, connection);
    }

    @OnClose
    public void onClose() {
        String id = connection.id();
        connections.remove(id);
    }

    @OnTextMessage
    public void onMessage(String message) {}

    public static void broadcast(String discussionId, String messageJson) {
        connections.forEach((id, conn) -> {
            try {
                if (discussionId.equals(conn.pathParam("discussionId"))) {
                    conn.sendTextAndAwait(messageJson);
                }
            } catch (Exception e) {
                connections.remove(id);
            }
        });
    }
}