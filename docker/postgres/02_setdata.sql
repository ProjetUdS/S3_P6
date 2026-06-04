-- Users
INSERT INTO app.utilisateur (cip, pseudo, courriel, nom, prenom, photo_de_profil_id)
VALUES ('tura2517', 'tura2517', 'tura2517@usherbrooke.ca', 'Turcotte', 'Adam', null);

INSERT INTO app.utilisateur(cip, pseudo, courriel, nom, prenom, photo_de_profil_id)
VALUES ('grae3425', 'grae3425', 'grae3425@usherbrooke.ca', 'Grable', 'Elea', null);

INSERT INTO app.utilisateur(cip, pseudo, courriel, nom, prenom, photo_de_profil_id)
VALUES ('daly0396', 'Yo', 'daly0396@usherbrooke.ca', 'Dallaire', 'Yohan', null);

INSERT INTO app.utilisateur(cip, pseudo, courriel, nom, prenom, photo_de_profil_id)
VALUES ('benx0939', 'Xav', 'benx0939@usherbrooke.ca', 'Benoit', 'Xavier', null);

-- Contacts
INSERT INTO app.contact (cip, cip_contact)
VALUES ('tura2517', 'grae3425');

INSERT INTO app.contact (cip, cip_contact)
VALUES ('tura2517', 'daly0396');

-- Equipe
INSERT INTO app.equipe (equipe_id, administrateur, nom_equipe)
VALUES ('12345', 'tura2517', 'Equipe test');

-- Ajoute gens à équipe
INSERT INTO app.est_dans (cip, equipe_id)
VALUES ('tura2517', '12345');

INSERT INTO app.est_dans (cip, equipe_id)
VALUES ('daly0396', '12345');


-- Tache
INSERT INTO app.tache (tache_id, nom_tache, status, description, date_creation, date_debut, date_fin, equipe_id, cip)
VALUES ('tache1',
        'Faire projet',
        'en cours',
        'Implémenter le code',
        '2026-06-04',
        '2026-06-04',
        '2026-06-05',
        '12345',
        'tura2517');

-- Assigne tache
INSERT INTO app.assignee (cip, tache_id)
VALUES ('daly0936','tache1');

