Exemple de Message
==================

### Configuration des hooks Git

Les hooks Git sont versionnés dans `git_hooks/`. Activez-les après le clonage :

```sh
git config core.hooksPath ./git_hooks
```

Cela indique à Git d'utiliser les scripts dans `git_hooks/` au lieu de `.git/hooks/`.

Les hooks installés :
- **pre-commit** : chiffre les secrets avec SOPS avant chaque commit et bloque les fichiers plaintext
- **post-checkout** : déchiffre automatiquement les secrets après un changement de branche

> **Note Windows :** Utilisez Git Bash (inclus avec Git for Windows) pour exécuter ces commandes. Les hooks utilisent un shell POSIX compatible avec Git Bash/MSYS2.

> **Note GitHub Desktop :** Ce client ne déclenche pas les hooks Git (il utilise sa propre librairie git). Après un changement de branche, exécutez la configuration **Decrypt** dans IntelliJ (ou `python3 python/sops_manage.py decrypt` en ligne de commande) pour déchiffrer les secrets.

### Gestion des fichiers secrets

La liste des fichiers secrets est unique : elle se trouve dans **`git_hooks/.hooks-config`**.

Pour ajouter un fichier secret, ajouter une entrée dans la section `[plaintext]` :

```ini
[plaintext]
secrets.yaml
src/main/resources/application.yaml
# ajouter d'autres fichiers plaintext ici ...
```

Le fichier chiffré correspondant (`nom.ext.enc`) est généré automatiquement en ajoutant `.enc` à la fin du nom.

Tout format supporté par SOPS est compatible (`.yaml`, `.json`, `.env`, `.xml`, etc.).

Les commandes disponibles :

- **`python3 python/sops_manage.py encrypt`** ou configuration IntelliJ **Encrypt** — chiffre les fichiers
- **`python3 python/sops_manage.py decrypt`** ou configuration IntelliJ **Decrypt** — déchiffre les fichiers

### Comment l'exécuter

Mettre en place la base de données postgres et les autres services nginx et keycloak via les commandes suivantes :

- cd docker
- docker-compose up -d

Démarrer le serveur d'application

- Démarrer le service en exécutant `message.main` dans Intellij
- Tester un service dans un navigateur : http://localhost:8888/q/swagger-ui

Utiliser l'application

- Tester le serveur web dans un navigateur : localhost
# test
