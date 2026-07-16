package ca.usherbrooke.fgen.api.service;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket(path = "/ws/requeteAmi/{cip}")
public class RequeteAmiWebSocket {

    private static final Map<String, WebSocketConnection> connections = new ConcurrentHashMap<>();

    @Inject
    WebSocketConnection connection;

    @OnOpen
    public void onOpen() {
        connections.put(connection.id(), connection);
    }

    @OnClose
    public void onClose() {
        connections.remove(connection.id());
    }

    @OnTextMessage
    public void onMessage(String message) {}

    public static void broadcast(String cip, String requeteJson) {
        connections.values().stream()
                .filter(c -> cip.equals(c.pathParam("cip")))
                .forEach(c -> c.sendTextAndAwait(requeteJson));
    }
}