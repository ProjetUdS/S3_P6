import ca.usherbrooke.fgen.api.business.Equipe;
import ca.usherbrooke.fgen.api.mapper.EquipeMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DatabaseEquipeTest {
        @Test
        public void testSelectMessage() {
                EquipeMapper mapper = Mockito.mock(EquipeMapper.class);
                Equipe equipe = new Equipe();
                equipe.id = "42";
                equipe.administrateur = "belx8646";
                equipe.nomEquipe = "Canadiens de Montreal";
                verify(mapper).insertEquipe(equipe);

                when(mapper.select(["belx8646"], "42", ""))
                var result = mapper.select("67", 2, 0, "belx8646", "69");
                assert result != null;
        }
}