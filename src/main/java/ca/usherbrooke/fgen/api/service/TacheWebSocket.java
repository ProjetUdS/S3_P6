package ca.usherbrooke.fgen.api.service;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket(path = "/ws/tache/{equipeId}")
public class TacheWebSocket {

    private static final Map<String, WebSocketConnection> connections = new ConcurrentHashMap<>();

    @Inject
    WebSocketConnection connection;

    @OnOpen
    public void onOpen() {
        String id = connection.id();
        connections.put(connection.id(), connection);
    }

    @OnClose
    public void onClose() {
        String id = connection.id();
        connections.remove(connection.id());
    }

    @OnTextMessage
    public void onMessage(String message) {}

    public static void broadcast(String equipeId, String tacheJson) {
        connections.forEach((id, conn) -> {
            try {
                if (equipeId.equals(conn.pathParam("equipeId"))) {
                    conn.sendTextAndAwait(tacheJson);
                }
            } catch (Exception e) {
                connections.remove(id);
            }
        });
    }
}