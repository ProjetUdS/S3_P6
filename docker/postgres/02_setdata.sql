-- Users
INSERT INTO app.utilisateur (cip, pseudo, courriel, nom, prenom, photo_de_profil_id)
VALUES ('tura2517', 'tura2517', 'tura2517@usherbrooke.ca', 'Turcotte', 'Adam', null);

INSERT INTO app.utilisateur(cip, pseudo, courriel, nom, prenom, photo_de_profil_id)
VALUES ('grae3425', 'grae3425', 'grae3425@usherbrooke.ca', 'Grable', 'Elea', null);

INSERT INTO app.utilisateur(cip, pseudo, courriel, nom, prenom, photo_de_profil_id)
VALUES ('daly0396', 'Yo', 'daly0396@usherbrooke.ca', 'Dallaire', 'Yohan', null);

-- Contacts
INSERT INTO app.contact (cip,cip_contact)
VALUES ('tura2517','grae3425');

INSERT INTO app.contact (cip,cip_contact)
VALUES ('tura2517','daly0396');

