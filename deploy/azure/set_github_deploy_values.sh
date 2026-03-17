#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  set_github_deploy_values.sh <app-name> <publish-profile-path> [repo]

Example:
  set_github_deploy_values.sh axinom-ingest-helper ~/Downloads/axinom.publishsettings jasonbritton12/JSON_Ingest_Templates

Notes:
  - Requires GitHub CLI (`gh`) and an authenticated `gh auth login` session.
  - Sets:
      variable AZURE_WEBAPP_NAME
      secret   AZURE_WEBAPP_PUBLISH_PROFILE
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 2 || $# -gt 3 ]]; then
  usage >&2
  exit 1
fi

APP_NAME="$1"
PUBLISH_PROFILE_PATH="$2"
REPO="${3:-}"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi

if [[ ! -f "$PUBLISH_PROFILE_PATH" ]]; then
  echo "Publish profile file not found: $PUBLISH_PROFILE_PATH" >&2
  exit 1
fi

REPO_ARGS=()
if [[ -n "$REPO" ]]; then
  REPO_ARGS+=(--repo "$REPO")
fi

echo "Setting repository variable AZURE_WEBAPP_NAME"
gh variable set AZURE_WEBAPP_NAME "${REPO_ARGS[@]}" --body "$APP_NAME"

echo "Setting repository secret AZURE_WEBAPP_PUBLISH_PROFILE"
gh secret set AZURE_WEBAPP_PUBLISH_PROFILE "${REPO_ARGS[@]}" < "$PUBLISH_PROFILE_PATH"

echo
echo "GitHub Actions deployment values updated."
echo "Next step: run the 'Deploy Azure Web App' workflow from the Actions tab or push a new commit."
