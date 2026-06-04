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


ALTER SCHEMA app OWNER TO postgres;;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE app.Utilisateur(
                            cip VARCHAR(50),
                            pseudo VARCHAR(50) NOT NULL,
                            courriel VARCHAR(50) NOT NULL,
                            nom VARCHAR(50),
                            prenom VARCHAR(50),
                            photo_de_profil_id VARCHAR(50),
                            PRIMARY KEY(cip),
                            UNIQUE(pseudo),
                            UNIQUE(courriel)
);

CREATE TABLE app.Equipe(
                       equipe_id VARCHAR(50),
                       administrateur VARCHAR(50) NOT NULL,
                       nom_equipe VARCHAR(50) NOT NULL,
                       PRIMARY KEY(equipe_id),
                       UNIQUE(nom_equipe, administrateur)
);

CREATE TABLE app.Discussion(
                           discussion_id VARCHAR(50),
                           equipe_id VARCHAR(50) NOT NULL,
                           PRIMARY KEY(discussion_id),
                           UNIQUE(equipe_id),
                           FOREIGN KEY(equipe_id) REFERENCES app.Equipe(equipe_id)
);

CREATE TABLE app.Message(
                        message_id VARCHAR(50),
                        date_ DATE,
                        contenu VARCHAR(50),
                        cip VARCHAR(50) NOT NULL,
                        discussion_id VARCHAR(50) NOT NULL,
                        PRIMARY KEY(message_id),
                        FOREIGN KEY(cip) REFERENCES app.Utilisateur(cip),
                        FOREIGN KEY(discussion_id) REFERENCES app.Discussion(discussion_id)
);

CREATE TABLE app.Tache(
                      tache_id VARCHAR(50),
                      nom_tache VARCHAR(50),
                      status VARCHAR(50) NOT NULL,
                      description TEXT,
                      date_creation DATE NOT NULL,
                      date_debut DATE,
                      date_fin DATE,
                      equipe_id VARCHAR(50) NOT NULL,
                      cip VARCHAR(50) NOT NULL,
                      PRIMARY KEY(tache_id),
                      FOREIGN KEY(equipe_id) REFERENCES app.Equipe(equipe_id),
                      FOREIGN KEY(cip) REFERENCES app.Utilisateur(cip)
);

CREATE TABLE app.Est_dans(
                         cip VARCHAR(50),
                         equipe_id VARCHAR(50),
                         PRIMARY KEY(cip, equipe_id),
                         FOREIGN KEY(cip) REFERENCES app.Utilisateur(cip),
                         FOREIGN KEY(equipe_id) REFERENCES app.Equipe(equipe_id)
);

CREATE TABLE app.Assignee(
                         cip VARCHAR(50),
                         tache_id VARCHAR(50),
                         PRIMARY KEY(cip, tache_id),
                         FOREIGN KEY(cip) REFERENCES app.Utilisateur(cip),
                         FOREIGN KEY(tache_id) REFERENCES app.Tache(tache_id)
);

CREATE TABLE app.Fait_parti(
                           cip VARCHAR(50),
                           discussion_id VARCHAR(50),
                           PRIMARY KEY(cip, discussion_id),
                           FOREIGN KEY(cip) REFERENCES app.Utilisateur(cip),
                           FOREIGN KEY(discussion_id) REFERENCES app.Discussion(discussion_id)
);

CREATE TABLE app.Contact(
                        cip VARCHAR(50),
                        cip_contact VARCHAR(50),
                        PRIMARY KEY(cip, cip_contact),
                        FOREIGN KEY(cip) REFERENCES app.Utilisateur(cip),
                        FOREIGN KEY(cip_contact) REFERENCES app.Utilisateur(cip)
);

ALTER TABLE app.message OWNER TO postgres;

--
-- TOC entry 2983 (class 0 OID 16431)
-- Dependencies: 201
-- Data for Name: message; Type: TABLE DATA; Schema: app; Owner: postgres
--
