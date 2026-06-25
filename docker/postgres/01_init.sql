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

CREATE TABLE app.Utilisateur
(
    cip                VARCHAR(50),
    pseudo             VARCHAR(50) NOT NULL,
    courriel           TEXT        NOT NULL,
    nom                TEXT,
    prenom             TEXT,
    photo_de_profil_id TEXT,
    PRIMARY KEY (cip),
    UNIQUE (pseudo),
    UNIQUE (courriel)
);

CREATE TABLE app.Discussion
(
    discussion_id VARCHAR(50),
    PRIMARY KEY (discussion_id)
);

CREATE TABLE app.Message
(
    message_id    VARCHAR(50),
    date_         TIMESTAMP,
    contenu       TEXT,
    cip           VARCHAR(50) NOT NULL,
    discussion_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (message_id),
    FOREIGN KEY (cip) REFERENCES app.Utilisateur (cip),
    FOREIGN KEY (discussion_id) REFERENCES app.Discussion (discussion_id)
);

CREATE TABLE app.Roles
(
    role_id  VARCHAR(50),
    nom_role TEXT NOT NULL,
    PRIMARY KEY (role_id)
);

CREATE TABLE app.Permissions
(
    permission_id  VARCHAR(50),
    nom_permission TEXT NOT NULL,
    PRIMARY KEY (permission_id),
    UNIQUE (nom_permission)
);

CREATE TABLE app.Equipe
(
    equipe_id          VARCHAR(50),
    administrateur_cip VARCHAR(50) NOT NULL,
    nom_equipe         TEXT        NOT NULL,
    discussion_id      VARCHAR(50) NOT NULL,
    PRIMARY KEY (equipe_id),
    UNIQUE (discussion_id),
    UNIQUE (nom_equipe),
    FOREIGN KEY (discussion_id) REFERENCES app.Discussion (discussion_id)
);

CREATE TABLE app.Tache
(
    tache_id      VARCHAR(50),
    nom_tache     TEXT,
    status        VARCHAR(50) NOT NULL,
    description   TEXT,
    date_creation TIMESTAMP   NOT NULL,
    date_debut    TIMESTAMP,
    date_fin      TIMESTAMP,
    equipe_id     VARCHAR(50) NOT NULL,
    cip           VARCHAR(50) NOT NULL,
    PRIMARY KEY (tache_id),
    FOREIGN KEY (equipe_id) REFERENCES app.Equipe (equipe_id) ON DELETE CASCADE,
    FOREIGN KEY (cip) REFERENCES app.Utilisateur (cip)
);

CREATE TABLE app.Est_dans
(
    cip       VARCHAR(50),
    equipe_id VARCHAR(50),
    PRIMARY KEY (cip, equipe_id),
    FOREIGN KEY (cip) REFERENCES app.Utilisateur (cip) ,
    FOREIGN KEY (equipe_id) REFERENCES app.Equipe (equipe_id) ON DELETE CASCADE
);

CREATE TABLE app.Assignee
(
    cip      VARCHAR(50),
    tache_id VARCHAR(50),
    PRIMARY KEY (cip, tache_id),
    FOREIGN KEY (cip) REFERENCES app.Utilisateur (cip),
    FOREIGN KEY (tache_id) REFERENCES app.Tache (tache_id) ON DELETE CASCADE
);

CREATE TABLE app.Fait_parti(
                           cip VARCHAR(50),
                           discussion_id VARCHAR(50),
                           etat VARCHAR(20) NOT NULL,
                           PRIMARY KEY(cip, discussion_id),
                           FOREIGN KEY(cip) REFERENCES app.Utilisateur(cip),
                           FOREIGN KEY(discussion_id) REFERENCES app.Discussion(discussion_id)
);

CREATE TABLE app.Contact
(
    cip_contact VARCHAR(50),
    cip         VARCHAR(50),
    PRIMARY KEY (cip_contact, cip),
    FOREIGN KEY (cip_contact) REFERENCES app.Utilisateur (cip),
    FOREIGN KEY (cip) REFERENCES app.Utilisateur (cip)
);

CREATE TABLE app.A_role
(
    cip       VARCHAR(50),
    equipe_id VARCHAR(50),
    role_id   VARCHAR(50),
    PRIMARY KEY (cip, equipe_id, role_id),
    FOREIGN KEY (cip) REFERENCES app.Utilisateur (cip),
    FOREIGN KEY (equipe_id) REFERENCES app.Equipe (equipe_id),
    FOREIGN KEY (role_id) REFERENCES app.Roles (role_id)
);

CREATE TABLE app.Permets
(
    role_id       VARCHAR(50),
    permission_id VARCHAR(50),
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES app.Roles (role_id),
    FOREIGN KEY (permission_id) REFERENCES app.Permissions (permission_id)
);

CREATE TABLE app.RequeteAmi(
                           cip VARCHAR(50),
                           destinataire_cip VARCHAR(50),
                           PRIMARY KEY(cip, destinataire_cip),
                           FOREIGN KEY(cip) REFERENCES app.Utilisateur(cip)
);


ALTER TABLE app.message
    OWNER TO postgres;

--
-- TOC entry 2983 (class 0 OID 16431)
-- Dependencies: 201
-- Data for Name: message; Type: TABLE DATA; Schema: app; Owner: postgres
--
