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

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RequeteAmiWebSocketTest {

    private WebSocketConnection mockConnection;

    @BeforeEach
    void setUp() throws Exception {
        mockConnection = Mockito.mock(WebSocketConnection.class);
        when(mockConnection.pathParam("cip")).thenReturn("dest123");

        Field field = RequeteAmiWebSocket.class.getDeclaredField("connections");
        field.setAccessible(true);
        Map<String, RequeteAmiWebSocket.ConnectionInfo> connections =
                (Map<String, RequeteAmiWebSocket.ConnectionInfo>) field.get(null);
        connections.clear();
        connections.put("conn1", new RequeteAmiWebSocket.ConnectionInfo(mockConnection, "dest123"));
    }

    @Test
    void testBroadcastEnvoieAuBonDestinataire() {
        String requeteJson = "{\"type\":\"friendRequest\",\"de\":\"belx8646\",\"a\":\"dest123\"}";
        RequeteAmiWebSocket.broadcast("dest123", requeteJson);
        verify(mockConnection).sendTextAndAwait(requeteJson);
    }

    @Test
    void testBroadcastNEnvoiePasAuMauvaisDestinataire() {
        String requeteJson = "{\"type\":\"friendRequest\",\"de\":\"belx8646\",\"a\":\"dest123\"}";
        RequeteAmiWebSocket.broadcast("autrecip", requeteJson);
        verify(mockConnection, never()).sendTextAndAwait(any());
    }
}
