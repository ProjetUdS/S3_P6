package ca.usherbrooke.fgen.api.business;

import java.util.List;

public class Utilisateur {
    public String cip;
    public String pseudo;
    public String nom;
    public String prenom;
    public String courriel;
    public String photoProfilId;
    public List roles;

    public String toString() {
        return "Person{cip='" + this.cip + "', last_name='" + this.nom + "', first_name='" +
                this.prenom + "', email='" + this.courriel + "', photoProfilId='" + this.photoProfilId +
                "', roles=" + this.roles + "}";
    }
}