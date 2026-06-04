package ca.usherbrooke.fgen.api.record;

import java.util.List;

public record EquipeRecord (
        String equipeId,
        String administrateur,
        String nomEquipe,
        List<String> membersCip
) {}
