#!/usr/bin/env python3
"""Sync non-encrypted variables from .env.enc to webApp/.env"""
import os
import re

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_enc_path = os.path.join(root_dir, ".env.enc")
webapp_env_path = os.path.join(root_dir, "webApp", ".env")

if not os.path.exists(env_enc_path):
    print("Error: .env.enc not found")
    exit(1)

plain_vars = []
with open(env_enc_path, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        # Skip comments, empty lines, SOPS metadata, encrypted values
        if not line or line.startswith("#") or line.startswith("sops_") or "ENC[" in line:
            continue
        # Only keep lines matching KEY=VALUE format
        if re.match(r"^[A-Z_][A-Z0-9_]*=", line):
            plain_vars.append(line)

with open(webapp_env_path, "w", encoding="utf-8") as f:
    f.write("# Synced from .env.enc - do not edit manually\n\n")
    f.write("\n".join(plain_vars))
    f.write("\n")

print(f"Synced {len(plain_vars)} plain variables to webApp/.env")
