#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  provision_app_service.sh <resource-group> <location> <plan-name> <app-name> [sku]

Example:
  provision_app_service.sh axinom-rg westus2 axinom-plan axinom-ingest-helper B1

Notes:
  - Requires Azure CLI and an active `az login` session.
  - Creates a Linux App Service plan and Python web app.
  - Sets the startup command to `bash startup.sh`.
  - Enables build automation for ZIP deploy / GitHub Actions package deployment.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 4 || $# -gt 5 ]]; then
  usage >&2
  exit 1
fi

RESOURCE_GROUP="$1"
LOCATION="$2"
PLAN_NAME="$3"
APP_NAME="$4"
SKU="${5:-B1}"

if ! command -v az >/dev/null 2>&1; then
  echo "Azure CLI (az) is required." >&2
  exit 1
fi

echo "Creating or updating resource group: $RESOURCE_GROUP"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output table

echo "Creating or updating Linux App Service plan: $PLAN_NAME"
az appservice plan create \
  --name "$PLAN_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --is-linux \
  --sku "$SKU" \
  --output table

echo "Creating web app: $APP_NAME"
az webapp create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$PLAN_NAME" \
  --runtime "PYTHON|3.11" \
  --output table

echo "Configuring startup command"
az webapp config set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --startup-file "bash startup.sh" \
  --output table

echo "Enabling App Service build automation for deployment package installs"
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true \
  --output table

echo
echo "Web app ready:"
echo "  https://${APP_NAME}.azurewebsites.net"
echo
echo "Next steps:"
echo "  1. Download the publish profile from the Azure portal."
echo "  2. Run deploy/azure/set_github_deploy_values.sh to store the GitHub variable + secret."
echo "  3. Trigger the 'Deploy Azure Web App' GitHub Actions workflow."
