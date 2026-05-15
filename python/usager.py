import csv
import json

users = []

with open("usagers.csv", newline='', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile, delimiter=';')
    next(reader)  # sauter l'en-tête

    for row in reader:
        if len(row) < 5:
            continue  # ignorer lignes incomplètes

        equipe, cip, email, nom_complet, programme = row[0], row[2], row[3], row[4], row[5]

        # Séparer "Nom, Prénom"
        if ',' in nom_complet:
            last_name, first_name = [part.strip() for part in nom_complet.split(',', 1)]
        else:
            last_name, first_name = nom_complet.strip(), ""

        user = {
            "username": cip,
            "enabled": True,
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "realmRoles": [
                "teacher",
                "default-roles-master"
            ],
            "credentials": [
                {
                    "temporary": True,
                    "type": "password",
                    "value": "projet"
                }
            ]
        }
        users.append(user)

# Structure finale JSON
output = {
    "realm": "api",
    "users": users
}

with open("users.json", "w", encoding="utf-8") as jsonfile:
    json.dump(output, jsonfile, indent=2, ensure_ascii=False)
