package ca.usherbrooke.fgen.api.service;

import io.quarkus.websockets.next.WebSocketConnection;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TacheWebSocketTest {

    private WebSocketConnection mockConnection;

    @BeforeEach
    void setUp() throws Exception {
        mockConnection = Mockito.mock(WebSocketConnection.class);
        when(mockConnection.pathParam("equipeId")).thenReturn("4321");

        Field field = TacheWebSocket.class.getDeclaredField("connections");
        field.setAccessible(true);
        Map<String, WebSocketConnection> connections = new ConcurrentHashMap<>();
        connections.put("conn1", mockConnection);
        field.set(null, connections);
    }

    @Test
    void testBroadcastEnvoieALaBonneEquipe() {
        String tacheJson = "{\"type\":\"taskUpdated\",\"tacheId\":\"1234\",\"equipeId\":\"4321\"}";
        TacheWebSocket.broadcast("4321", tacheJson);
        verify(mockConnection).sendTextAndAwait(tacheJson);
    }

    @Test
    void testBroadcastNEnvoiePasALaMauvaiseEquipe() {
        String tacheJson = "{\"type\":\"taskUpdated\",\"tacheId\":\"1234\",\"equipeId\":\"4321\"}";
        TacheWebSocket.broadcast("9999", tacheJson);
        verify(mockConnection, never()).sendTextAndAwait(any());
    }
}