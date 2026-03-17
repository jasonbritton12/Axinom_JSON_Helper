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

## Expected URL

Without a custom domain, the app will be available at:

```text
https://<APP_NAME>.azurewebsites.net
```

That URL can be shared directly with end users.
