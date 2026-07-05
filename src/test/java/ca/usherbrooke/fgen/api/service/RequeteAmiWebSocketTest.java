package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.mapper.RequeteAmiMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequeteAmiWebSocketTest {

    @Test
    void testInsertRequete() {
        RequeteAmiMapper mapper = Mockito.mock(RequeteAmiMapper.class);

        doNothing().when(mapper).insertRequete("belx8646", "dest123");
        mapper.insertRequete("belx8646", "dest123");
        verify(mapper).insertRequete("belx8646", "dest123");
    }
}