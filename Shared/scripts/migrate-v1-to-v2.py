#!/usr/bin/env python3
"""
USB-Uncensored-LLM v1 -> v2 Migration Script
=============================================
Migrates user data from v1 locations to v2 structure.
Run AFTER upgrading the project files but BEFORE starting the chat server.

What this migrates:
  1. Chat history (Shared/chat_data/chats.json) — already compatible
  2. Settings file — moved from chat_data/ to Shared/config/
  3. Generates auth token if missing (v2 security feature)
"""
import json
import os
import shutil
import sys
import uuid

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SHARED_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
CONFIG_DIR = os.path.join(SHARED_DIR, "config")
CHAT_DATA_DIR = os.path.join(SHARED_DIR, "chat_data")
BACKUP_DIR = os.path.join(SHARED_DIR, "backup-v1")

OLD_SETTINGS_PATH = os.path.join(CHAT_DATA_DIR, "settings.json")
NEW_SETTINGS_PATH = os.path.join(CONFIG_DIR, "settings.json")

AUTH_TOKEN_FILE = os.path.join(CHAT_DATA_DIR, ".auth_token")


def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


def migrate_settings():
    if not os.path.exists(OLD_SETTINGS_PATH):
        print("  [SKIP] No v1 settings found at", OLD_SETTINGS_PATH)
        return True

    try:
        with open(OLD_SETTINGS_PATH, "r", encoding="utf-8") as f:
            settings = json.load(f)
    except Exception as e:
        eprint(f"  [WARN] Could not read v1 settings: {e}")
        return False

    os.makedirs(CONFIG_DIR, exist_ok=True)

    # Merge with v2 defaults
    default_settings = {
        "globalSystemPrompt": settings.get("globalSystemPrompt", ""),
        "temperature": settings.get("temperature", 0.7),
        "logMode": settings.get("logMode", "errors_only"),
    }

    try:
        if os.path.exists(NEW_SETTINGS_PATH):
            with open(NEW_SETTINGS_PATH, "r", encoding="utf-8") as f:
                existing = json.load(f)
            if isinstance(existing, dict):
                existing.update(default_settings)
                default_settings = existing

        with open(NEW_SETTINGS_PATH, "w", encoding="utf-8") as f:
            json.dump(default_settings, f, ensure_ascii=False, indent=2)
        print(f"  [OK] Settings migrated to {NEW_SETTINGS_PATH}")
        return True
    except Exception as e:
        eprint(f"  [ERR] Failed to write new settings: {e}")
        return False


def backup_old_settings():
    if not os.path.exists(OLD_SETTINGS_PATH):
        return True
    os.makedirs(BACKUP_DIR, exist_ok=True)
    try:
        shutil.copy2(OLD_SETTINGS_PATH, os.path.join(BACKUP_DIR, "settings.json"))
        print(f"  [OK] v1 settings backed up to {BACKUP_DIR}/settings.json")
        return True
    except Exception as e:
        eprint(f"  [WARN] Could not back up old settings: {e}")
        return False


def ensure_auth_token():
    if os.path.exists(AUTH_TOKEN_FILE):
        print("  [SKIP] Auth token already exists")
        return True
    token = uuid.uuid4().hex
    try:
        os.makedirs(os.path.dirname(AUTH_TOKEN_FILE), exist_ok=True)
        with open(AUTH_TOKEN_FILE, "w") as f:
            f.write(token)
        print(f"  [OK] Auth token generated: {token[:8]}...{token[-4:]}")
        return True
    except Exception as e:
        eprint(f"  [WARN] Could not generate auth token: {e}")
        return False


def main():
    print("=" * 55)
    print("  USB-Uncensored-LLM v1 -> v2 Migration")
    print("=" * 55)
    print()

    errors = 0

    print("[1/3] Backing up v1 settings...")
    if not backup_old_settings():
        errors += 1

    print()
    print("[2/3] Migrating settings to Shared/config/...")
    if not migrate_settings():
        errors += 1

    print()
    print("[3/3] Ensuring auth token (v2 security)...")
    if not ensure_auth_token():
        errors += 1

    print()
    print("=" * 55)
    if errors:
        print(f"  Migration completed with {errors} warning(s).")
        print("  Your data is safe; check messages above.")
    else:
        print("  Migration completed successfully!")
        print("  You can now start the v2 chat server.")
    print("=" * 55)
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
