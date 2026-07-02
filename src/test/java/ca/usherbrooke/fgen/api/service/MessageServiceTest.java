package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Message;
import ca.usherbrooke.fgen.api.mapper.MessageMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Test
    void sendMessage() {
        MessageMapper mapper = Mockito.mock(MessageMapper.class);
        Message message = new Message();
        message.contenu = "test";
        message.cip = "belx8646";
        message.discussionId = "67";

        doNothing().when(mapper).insertMessage(message);
        mapper.insertMessage(message);
        verify(mapper).insertMessage(message);
    }

    @Test
    void deleteMessage() {
        MessageMapper mapper = Mockito.mock(MessageMapper.class);

        doNothing().when(mapper).deleteOne("69", "67");
        mapper.deleteOne("69", "67");
        verify(mapper).deleteOne("69", "67");
    }
}