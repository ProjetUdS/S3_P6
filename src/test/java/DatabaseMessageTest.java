import ca.usherbrooke.fgen.api.business.Message;
import ca.usherbrooke.fgen.api.mapper.MessageMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DatabaseMessageTest {
        @Test
        public void testSelectMessage() {
                MessageMapper mapper = Mockito.mock(MessageMapper.class);
                Message message = new Message();
                message.id = "69";
                message.date = new Date();
                message.contenu = "Adam est vraiment fatiguant et il me critique tout le temps";
                message.cip = "belx8646";
                message.discussionId = "67";
                mapper.insertMessage(message);
                verify(mapper).insertMessage(message);

                when(mapper.select("67", 2, 0, "belx8646", "69")).thenReturn(Arrays.asList(message));
                var result = mapper.select("67", 2, 0, "belx8646", "69");
                assert result != null;
        }

        @Test
        public void testSelectOneMessage() {
                MessageMapper mapper = Mockito.mock(MessageMapper.class);
                Message message = new Message();
                message.id = "69";
                message.date = new Date();
                message.contenu = "Adam est vraiment fatiguant et il me critique tout le temps";
                message.cip = "belx8646";
                message.discussionId = "67";
                mapper.insertMessage(message);
                verify(mapper).insertMessage(message);

                when(mapper.selectOne("69")).thenReturn(message);
                var result = mapper.selectOne("69");
                assert result != null;
        }

        @Test
        public void testDeleteOneMessage() {
                MessageMapper mapper = Mockito.mock(MessageMapper.class);
                Message message = new Message();
                message.id = "69";
                message.date = new Date();
                message.contenu = "Adam est vraiment fatiguant et il me critique tout le temps";
                message.cip = "belx8646";
                message.discussionId = "67";
                mapper.insertMessage(message);
                verify(mapper).insertMessage(message);

                doNothing().when(mapper).deleteOne("69", "67");
                mapper.deleteOne("69", "67");
                verify(mapper).deleteOne("69", "67");
        }

        @Test
        public void testInsertMessage() {
                MessageMapper mapper = Mockito.mock(MessageMapper.class);
                Message message = new Message();
                message.id = "69";
                message.date = new Date();
                message.contenu = "Adam est vraiment fatiguant et il me critique tout le temps";
                message.cip = "belx8646";
                message.discussionId = "67";
                mapper.insertMessage(message);
                verify(mapper).insertMessage(message);

                when(mapper.selectOne("69")).thenReturn(message);
                var result = mapper.selectOne("69");
                assert result != null;
        }
}