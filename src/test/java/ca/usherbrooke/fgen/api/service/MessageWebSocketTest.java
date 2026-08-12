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
class MessageWebSocketTest {

    private WebSocketConnection mockConnection;

    @BeforeEach
    void setUp() throws Exception {
        mockConnection = Mockito.mock(WebSocketConnection.class);
        when(mockConnection.pathParam("discussionId")).thenReturn("67");

        Field field = MessageWebSocket.class.getDeclaredField("connections");
        field.setAccessible(true);
        Map<String, MessageWebSocket.ConnectionInfo> connections =
                (Map<String, MessageWebSocket.ConnectionInfo>) field.get(null);
        connections.clear();
        connections.put("conn1", new MessageWebSocket.ConnectionInfo(mockConnection, "67"));
    }

    @Test
    void testBroadcastEnvoieAuBonneDiscussion() {
        String messageJson = "{\"type\":\"messageReceived\",\"messageId\":\"69\",\"discussionId\":\"67\"}";
        MessageWebSocket.broadcast("67", messageJson);
        verify(mockConnection).sendTextAndAwait(messageJson);
    }

    @Test
    void testBroadcastNEnvoiePasAuMauvaiseDiscussion() {
        String messageJson = "{\"type\":\"messageReceived\",\"messageId\":\"69\",\"discussionId\":\"67\"}";
        MessageWebSocket.broadcast("999", messageJson);
        verify(mockConnection, never()).sendTextAndAwait(any());
    }
}
