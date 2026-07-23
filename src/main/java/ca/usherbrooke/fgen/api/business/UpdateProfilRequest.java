package ca.usherbrooke.fgen.api.business;

/**
 * Corps de requête pour PATCH /api/utilisateur/{cip}.
 * Champ(s) null = non modifié(s), grâce au coalesce() dans le mapper.
 */
public class UpdateProfilRequest {
    public String pseudo;
}
