#!/usr/bin/env python3
"""Gérer les fichiers secrets SOPS (chiffrer / déchiffrer).

Lit la liste des fichiers plaintext depuis git_hooks/.hooks-config
(section [plaintext]) pour chiffrer/déchiffrer automatiquement.
"""

import sys
import subprocess
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
CONFIG_FILE = os.path.join(PROJECT_ROOT, "git_hooks", ".hooks-config")


def get_plaintext_files(config_path):
    """Read the [plaintext] section from .hooks-config and return file paths."""
    files = []
    in_section = False
    with open(config_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            section_match = re.match(r"^\[(.+)\]$", line)
            if section_match:
                in_section = section_match.group(1) == "plaintext"
                continue
            if in_section:
                files.append(line)
    return files


def enc_path(src):
    """Convert a plaintext path to its encrypted counterpart."""
    return f"{src}.enc"


def sops_type(src):
    """Return the SOPS input/output type for a file based on its extension."""
    _, ext = os.path.splitext(src)
    ext = ext.lower()
    if not ext and src.startswith("."):
        ext = src
    if not ext:
        return ""
    mapping = {
        ".yaml": "yaml",
        ".yml": "yaml",
        ".json": "json",
        ".env": "dotenv",
        ".xml": "xml",
        ".binary": "binary",
        ".bin": "binary",
        ".txt": "yaml",
    }
    return mapping.get(ext, "yaml")


def encrypt():
    for src in get_plaintext_files(CONFIG_FILE):
        dst = enc_path(src)
        print(f"Encrypting: {src} -> {dst}")
        if not os.path.exists(src):
            print(f"Warning: Source file {src} not found, skipping.")
            continue

        file_type = sops_type(src)
        cmd = ["sops", "-e"]
        if file_type:
            cmd.extend(["--input-type", file_type, "--output-type", file_type])
        cmd.extend(["--output", dst, src])

        try:
            subprocess.check_call(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
            )
            print(f"Success: {src} encrypted to {dst}")
        except subprocess.CalledProcessError as e:
            print(f"Error encrypting {src}: {e.stderr.decode()}")


def decrypt():
    for src in get_plaintext_files(CONFIG_FILE):
        enc = enc_path(src)
        print(f"Decrypting: {enc} -> {src}")
        if not os.path.exists(enc):
            print(f"Warning: Encrypted file {enc} not found, skipping.")
            continue

        file_type = sops_type(src)
        cmd = ["sops", "-d"]
        if file_type:
            cmd.extend(["--input-type", file_type, "--output-type", file_type])
        cmd.append(enc)

        tmp_path = src + ".tmp"
        try:
            with open(tmp_path, "w") as tmp:
                result = subprocess.run(
                    cmd,
                    stdout=tmp,
                    stderr=subprocess.PIPE,
                )
            if result.returncode != 0:
                raise subprocess.CalledProcessError(result.returncode, cmd, output=None, stderr=result.stderr)
            os.replace(tmp_path, src)
            print(f"Success: {enc} decrypted to {src}")
        except subprocess.CalledProcessError as e:
            print(f"Error decrypting {enc}: {e.stderr.decode()}")
            if os.path.exists(src + ".tmp"):
                os.remove(src + ".tmp")


if __name__ == "__main__":
    MODE = sys.argv[1] if len(sys.argv) > 1 else ""

    if not os.path.isfile(CONFIG_FILE):
        print(f"Error: config file not found: {CONFIG_FILE}", file=sys.stderr)
        sys.exit(1)

    if MODE == "encrypt":
        encrypt()
    elif MODE == "decrypt":
        decrypt()
    else:
        print(f"Usage: {sys.argv[0]} [encrypt|decrypt]", file=sys.stderr)
        sys.exit(1)
