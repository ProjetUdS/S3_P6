package ca.usherbrooke.fgen.api.record;

public record TeamMember(
    String cip,
    String pseudo,
    String nom,
    String prenom,
    String status,
    String role
) {
    public String fullName() {
        String firstName = prenom != null ? prenom : "";
        String lastName = nom != null ? nom : "";
        if (firstName.isEmpty() && lastName.isEmpty()) {
            return pseudo;
        }
        return (firstName + " " + lastName).trim();
    }
}
