package ca.usherbrooke.fgen.api.business;

/**
 * Corps de requête pour POST /api/utilisateur/{cip}/photo/confirm.
 * Envoyé par le frontend une fois le PUT vers l'URL présignée MinIO terminé.
 */
public class ConfirmPhotoRequest {
    public String fichierId;
}
