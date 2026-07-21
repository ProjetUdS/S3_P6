package ca.usherbrooke.fgen.api.service;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket(path = "/ws/requeteAmi/{cip}")
public class RequeteAmiWebSocket {

    private static final Map<String, ConnectionInfo> connections = new ConcurrentHashMap<>();

    @Inject
    WebSocketConnection connection;

    @OnOpen
    public void onOpen() {
        String id = connection.id();
        String targetCip = connection.pathParam("cip");
        connections.put(id, new ConnectionInfo(connection, targetCip));
    }

    @OnClose
    public void onClose() {
        String id = connection.id();
        connections.remove(id);
    }

    @OnTextMessage
    public void onMessage(String message) {}

    public static void broadcast(String cip, String requeteJson) {
        List<String> toRemove = new ArrayList<>();
        connections.forEach((id, info) -> {
            try {
                if (cip.equals(info.cip)) {
                    info.connection.sendTextAndAwait(requeteJson);
                }
            } catch (Exception e) {
                toRemove.add(id);
            }
        });
        toRemove.forEach(connections::remove);
    }

    private static class ConnectionInfo {
        final WebSocketConnection connection;
        final String cip;

        ConnectionInfo(WebSocketConnection connection, String cip) {
            this.connection = connection;
            this.cip = cip;
        }
    }
}