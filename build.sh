ENV_FILE=".env"

# 1 decrypt secrets
echo "Decrypting secrets"
python3 python/sops_manage.py decrypt
echo "Secrets decrypted"

# 2 source env file
# Enable automatic export, source the file, then disable automatic export
set -a
source "$ENV_FILE"
set +a

# 3 build quarkus app
echo "Building app"
./gradlew build
echo "App finished building"

# 4 build docker
echo "Building docker"
cd docker && docker compose build
echo "Docker finish building"
