# 1. SSH to the remote server
ssh <user>@<ip>

# 2. Navigate to the docker directory
cd /path/to/docker  # Update with your actual path

# 3. Pull the latest changes from git
git pull origin <your-branch-name>

# 4. Decrypt duck.env.enc (requires your AGE key)
sops -d --input-type dotenv --output-type dotenv docker/duck.env.enc > docker/duck.env

# 5. Restart traefik to pick up the new config and request the Let's Encrypt cert
docker compose restart traefik

# 6. Check traefik logs to confirm cert issuance
docker compose logs -f traefik
What to watch for in the logs:
- acme retribution or acme: try to solve challenge — Traefik is requesting the cert
- Completed all steps — Certificate issued successfully
- No module registered for provider duckdns — Something went wrong with the DuckDNS integration
  After cert is issued:
- Traefik will write the cert to acme.json in the certs directory
- You can delete the old cert.pem and key.pem files if you want (or leave them as fallback)