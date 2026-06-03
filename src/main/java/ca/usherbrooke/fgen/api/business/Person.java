package ca.usherbrooke.fgen.api.business;

import java.util.List;

public class Person {
    public String cip;
    public String pseudo;
    public String nom;
    public String prenom;
    public String courriel;
    public List roles;

    public String toString() {
        return "Person{cip='" + this.cip + "', last_name='" + this.last_name + "', first_name='" + this.first_name + "', email='" + this.email + "', roles=" + this.roles + "}";
    }
}