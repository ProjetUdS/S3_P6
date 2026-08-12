package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.ConfirmPhotoRequest;
import ca.usherbrooke.fgen.api.business.UpdateProfilRequest;
import ca.usherbrooke.fgen.api.business.Utilisateur;
import ca.usherbrooke.fgen.api.mapper.UtilisateurMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;

@Path("/api/utilisateur")
@Produces({"application/json"})
public class UtilisateurService {

    @Inject
    JsonWebToken jwt;

    @Inject
    UtilisateurMapper utilisateurMapper;

    @Inject
    MinioStorageService minioStorageService;

    @Inject
    KeycloakAccountService keycloakAccountService;

    @Context
    HttpHeaders httpHeaders;

    @GET
    @Path("/login")
    public Utilisateur login() {
        Utilisateur p = buildPersonFromJwt();
        utilisateurMapper.createUsager(
                p.cip, p.pseudo, p.courriel, p.nom, p.prenom, null
        );
        // Retourne l'utilisateur tel que persisté en BD (avec le vrai pseudo
        // custom et photoProfilId), pas l'objet dérivé du JWT qui vient d'être
        // utilisé pour l'upsert initial.
        return utilisateurMapper.selectOne(p.cip, null, null);
    }

    private Utilisateur buildPersonFromJwt() {
        Utilisateur p = new Utilisateur();
        p.cip = (String) this.jwt.getClaim("cip");
        p.pseudo = (String) this.jwt.getClaim("preferred_username");
        p.nom = (String) this.jwt.getClaim("family_name");
        p.prenom = (String) this.jwt.getClaim("given_name");
        p.courriel = (String) this.jwt.getClaim("email");
        Map realmAccess = (Map) this.jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            p.roles = (List) realmAccess.get("roles");
        }
        return p;
    }

    @GET
    public List<Utilisateur> getUtilisateurs(
            @QueryParam("cip") String cip,
            @QueryParam("pseudo") String pseudo,
            @QueryParam("courriel") String courriel,
            @QueryParam("nom") String nom,
            @QueryParam("prenom") String prenom) {
        return utilisateurMapper.select(cip, pseudo, courriel, nom, prenom);
    }

    @GET
    @Path("/get")
    public Utilisateur getUtilisateur(
            @QueryParam("cip") String cip,
            @QueryParam("pseudo") String pseudo,
            @QueryParam("courriel") String courriel) {
        return utilisateurMapper.selectOne(cip, pseudo, courriel);
    }

    /**
     * Met à jour le pseudo de l'utilisateur — à la fois dans Keycloak (le
     * username utilisé pour se connecter) et dans notre BD (l'affichage).
     * Keycloak est appelé en premier ("fail fast") : si ça échoue (pseudo
     * déjà pris, etc.), on ne touche pas à la BD locale.
     */
    @PATCH
    @Path("/{cip}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Utilisateur updateProfil(@PathParam("cip") String cip, UpdateProfilRequest body) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        if (body == null || body.pseudo == null || body.pseudo.isBlank()) {
            throw new WebApplicationException("Le pseudo ne peut pas être vide.", Response.Status.BAD_REQUEST);
        }
        if (body.pseudo.length() > 32) {
            throw new WebApplicationException("Le pseudo est trop long (max 32 caractères).", Response.Status.BAD_REQUEST);
        }
        String newPseudo = body.pseudo.trim();

        String authHeader = httpHeaders.getHeaderString(HttpHeaders.AUTHORIZATION);
        String userJwtToken = authHeader != null ? authHeader.replaceFirst("(?i)^Bearer ", "") : null;

        if (userJwtToken != null) {
            // Peut lancer UsernameAlreadyTakenException / InvalidUsernameException /
            // KeycloakAuthException — mappées automatiquement en réponses HTTP
            // via WebApplicationException, donc pas besoin de try/catch ici.
            keycloakAccountService.updateUsername(userJwtToken, newPseudo);
        }

        utilisateurMapper.updateUtilisateur(cip, newPseudo, null, null, null, null);
        return utilisateurMapper.selectOne(cip, null, null);
    }

    /**
     * Confirme qu'un fichier (déjà uploadé sur MinIO via le service /fichiers
     * générique — voir getUploadUrl/uploadToUrl côté frontend) est la nouvelle
     * photo de profil. Supprime l'ancienne photo de MinIO si elle existe.
     */
    @POST
    @Path("/{cip}/photo/confirm")
    @Consumes(MediaType.APPLICATION_JSON)
    public Utilisateur confirmPhoto(@PathParam("cip") String cip, ConfirmPhotoRequest body) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        if (body == null || body.fichierId == null || body.fichierId.isBlank()) {
            throw new WebApplicationException("fichierId est requis.", Response.Status.BAD_REQUEST);
        }

        Utilisateur avant = utilisateurMapper.selectOne(cip, null, null);

        utilisateurMapper.updateUtilisateur(cip, null, null, null, null, body.fichierId);

        if (avant != null && avant.photoProfilId != null) {
            minioStorageService.removeObject(avant.photoProfilId);
        }

        return utilisateurMapper.selectOne(cip, null, null);
    }

    /**
     * Retire la photo de profil (remet photo_de_profil_id à NULL en BD
     * et supprime l'objet de MinIO).
     */
    @DELETE
    @Path("/{cip}/photo")
    public Utilisateur deletePhoto(@PathParam("cip") String cip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        Utilisateur avant = utilisateurMapper.selectOne(cip, null, null);
        if (avant != null && avant.photoProfilId != null) {
            minioStorageService.removeObject(avant.photoProfilId);
        }

        // coalesce() ne permet pas de remettre un champ à NULL (null = "ne pas changer"),
        // d'où le besoin de clearPhoto() séparé — voir mapper-addition.xml fourni précédemment.
        utilisateurMapper.clearPhoto(cip);
        return utilisateurMapper.selectOne(cip, null, null);
    }

    /**
     * URL de téléchargement présignée pour la photo de profil.
     * Dédié (plutôt que de réutiliser /fichiers/download-url) car ce dernier
     * vérifie que le fichier est rattaché à un message dans une conversation
     * où l'utilisateur est membre — logique qui ne s'applique pas aux photos
     * de profil, qui n'ont aucun lien avec app.message/app.fichier_joint.
     */
    @GET
    @Path("/{cip}/photo/download-url")
    public MinioStorageService.PresignedUrlResponse getPhotoDownloadUrl(@PathParam("cip") String cip) {
        Utilisateur u = utilisateurMapper.selectOne(cip, null, null);
        if (u == null || u.photoProfilId == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
        return minioStorageService.generateDownloadUrl(u.photoProfilId);
    }

    @DELETE
    @Path("/{cip}")
    public String deleteUtilisateur(@PathParam("cip") String cip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        utilisateurMapper.deleteOne(cip);
        return "Deleted (200)";
    }

    @POST
    @Path("/{cip}/contact/{contact_cip}")
    public String ajouteContact(@PathParam("cip") String cip, @PathParam("contact_cip") String cip_contact) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        utilisateurMapper.insertContact(cip, cip_contact);
        return "200";
    }

    @GET
    @Path("/contacts")
    public List<Utilisateur> getContacts(@QueryParam("userCip") String cip) {
        String cipConnecte = (String) jwt.getClaim("cip");
        if (!cipConnecte.equals(cip)) {
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
        return utilisateurMapper.getContacts(cip);
    }
}