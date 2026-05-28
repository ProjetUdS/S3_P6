--
-- PostgreSQL database dump
--

-- Dumped from database version 13.6 (Debian 13.6-1.pgdg110+1)
-- Dumped by pg_dump version 14.1

-- Started on 2022-05-25 18:13:12 EDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 16385)
-- Name: app; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA app;


ALTER SCHEMA app OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE Utilisateur(
                            pseudo TEXT,
                            courriel TEXT NOT NULL,
                            nom TEXT,
                            prenom TEXT,
                            photo_de_profil_id TEXT,
                            PRIMARY KEY(pseudo),
                            UNIQUE(courriel)
);

CREATE TABLE Équipe(
                       equipe_id TEXT,
                       Administrateur TEXT NOT NULL,
                       nom_équipe TEXT NOT NULL,
                       PRIMARY KEY(equipe_id),
                       UNIQUE(Administrateur),
                       UNIQUE(nom_équipe)
);

CREATE TABLE Discussion(
                           discussion_id TEXT,
                           equipe_id TEXT NOT NULL,
                           PRIMARY KEY(discussion_id),
                           UNIQUE(equipe_id),
                           FOREIGN KEY(equipe_id) REFERENCES Équipe(equipe_id)
);

CREATE TABLE Message(
                        message_id TEXT,
                        Date_ DATE,
                        Heure TIME,
                        Contenu TEXT,
                        pseudo TEXT NOT NULL,
                        discussion_id TEXT NOT NULL,
                        PRIMARY KEY(message_id),
                        FOREIGN KEY(pseudo) REFERENCES Utilisateur(pseudo),
                        FOREIGN KEY(discussion_id) REFERENCES Discussion(discussion_id)
);

CREATE TABLE Tâche(
                      tache_id TEXT,
                      nom_tache TEXT,
                      date_creation DATE NOT NULL,
                      date_début DATE,
                      date_fin DATE,
                      equipe_id TEXT NOT NULL,
                      pseudo TEXT NOT NULL,
                      PRIMARY KEY(tache_id),
                      FOREIGN KEY(equipe_id) REFERENCES Équipe(equipe_id),
                      FOREIGN KEY(pseudo) REFERENCES Utilisateur(pseudo)
);

CREATE TABLE PseudoEquipe(
                             pseudo TEXT,
                             equipe_id TEXT,
                             PRIMARY KEY(pseudo, equipe_id),
                             FOREIGN KEY(pseudo) REFERENCES Utilisateur(pseudo),
                             FOREIGN KEY(equipe_id) REFERENCES Équipe(equipe_id)
);

CREATE TABLE PseudoTache(
                            pseudo TEXT,
                            tache_id TEXT,
                            PRIMARY KEY(pseudo, tache_id),
                            FOREIGN KEY(pseudo) REFERENCES Utilisateur(pseudo),
                            FOREIGN KEY(tache_id) REFERENCES Tâche(tache_id)
);

CREATE TABLE Lire(
                     pseudo TEXT,
                     message_id TEXT,
                     PRIMARY KEY(pseudo, message_id),
                     FOREIGN KEY(pseudo) REFERENCES Utilisateur(pseudo),
                     FOREIGN KEY(message_id) REFERENCES Message(message_id)
);

CREATE TABLE PseudoDiscussion(
                                 pseudo TEXT,
                                 discussion_id TEXT,
                                 PRIMARY KEY(pseudo, discussion_id),
                                 FOREIGN KEY(pseudo) REFERENCES Utilisateur(pseudo),
                                 FOREIGN KEY(discussion_id) REFERENCES Discussion(discussion_id)
);
