#!/usr/bin/env bash
# Crée le dépôt sur GitHub (API) puis pousse la branche main.
# Usage :
#   export GH_TOKEN="ghp_xxxxxxxx"   # ou GITHUB_TOKEN
#   ./scripts/create-repo-and-push.sh [nom-du-repo]
#
# Token : PAT classique avec scope "repo" (ou fine-grained avec création de dépôts — voir README).
# Ne commite JAMAIS le token.

set -euo pipefail

REPO_NAME="${1:-portfolio-github}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "Erreur : définis GH_TOKEN ou GITHUB_TOKEN dans l’environnement." >&2
  exit 1
fi

echo "→ Création du dépôt « $REPO_NAME » sur GitHub (si inexistant)…"
HTTP_CODE=$(curl -sS -o /tmp/gh-create-repo.json -w "%{http_code}" -X POST "https://api.github.com/user/repos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"auto_init\":false}")

if [[ "$HTTP_CODE" == "201" ]]; then
  echo "   Dépôt créé."
elif [[ "$HTTP_CODE" == "422" ]]; then
  echo "   Dépôt déjà existant ou nom refusé (422). On continue vers le push…"
else
  echo "   Réponse API : HTTP $HTTP_CODE"
  cat /tmp/gh-create-repo.json 2>/dev/null || true
  if [[ "$HTTP_CODE" != "422" ]]; then
    exit 1
  fi
fi

LOGIN=$(curl -sS -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin).get('login',''))" 2>/dev/null || echo "")

if [[ -z "$LOGIN" ]]; then
  echo "Erreur : impossible de lire ton login GitHub (token invalide ?)." >&2
  exit 1
fi

URL_CLEAN="https://github.com/${LOGIN}/${REPO_NAME}.git"
# Push HTTPS avec le token une seule fois, puis remote sans token (évite de le laisser dans .git/config).
URL_AUTH="https://${LOGIN}:${TOKEN}@github.com/${LOGIN}/${REPO_NAME}.git"

echo "→ Remote origin → $URL_CLEAN"

git remote remove origin 2>/dev/null || true
git remote add origin "$URL_AUTH"

echo "→ git push -u origin main"
git push -u origin main

git remote set-url origin "$URL_CLEAN"

echo ""
echo "OK. Active GitHub Pages : Settings → Pages → Branch main / (root)."
