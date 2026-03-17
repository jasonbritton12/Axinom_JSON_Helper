# Azure App Service Setup

This repo is prepared to deploy the helper to Azure App Service using GitHub Actions and a publish profile.

## What The Repo Already Has

- `.github/workflows/deploy-azure-webapp.yml`
- `startup.sh`
- `requirements.txt`
- `webapp/server.py` updated to bind the host/port values used by managed web hosts

## What You Need To Create In Azure

1. Create an Azure App Service web app on Linux with a Python runtime.
2. Note the web app name. Example: `axinom-ingest-helper-prod`.
3. Set the startup command in App Service to:

```text
bash startup.sh
```

4. Download the web app publish profile from the Azure portal.

## Optional Helper Scripts In This Repo

- `deploy/azure/provision_app_service.sh`
  - Creates the resource group, Linux App Service plan, web app, startup command, and `SCM_DO_BUILD_DURING_DEPLOYMENT` setting.
- `deploy/azure/set_github_deploy_values.sh`
  - Stores the required GitHub repository variable and secret using GitHub CLI.

Example:

```bash
cd /Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates
./deploy/azure/provision_app_service.sh <RESOURCE_GROUP> <LOCATION> <PLAN_NAME> <APP_NAME> B1
./deploy/azure/set_github_deploy_values.sh <APP_NAME> <PATH_TO_PUBLISH_PROFILE> jasonbritton12/JSON_Ingest_Templates
```

## What You Need To Add In GitHub

In the GitHub repository settings:

1. Add a repository variable named `AZURE_WEBAPP_NAME`
   - Value: your Azure App Service app name
2. Add a repository secret named `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: paste the full publish profile XML from Azure

Once those are set, you can run the `Deploy Azure Web App` workflow manually or push to `main`.

## Azure CLI Equivalent

If you prefer CLI setup after creating the web app:

```bash
az webapp config set \
  --resource-group <RESOURCE_GROUP> \
  --name <APP_NAME> \
  --startup-file "bash startup.sh"
```

Enable build automation for the deployment package:

```bash
az webapp config appsettings set \
  --resource-group <RESOURCE_GROUP> \
  --name <APP_NAME> \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

## Expected URL

Without a custom domain, the app will be available at:

```text
https://<APP_NAME>.azurewebsites.net
```

That URL can be shared directly with end users.
