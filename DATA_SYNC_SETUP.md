# Data Sync Setup Guide

This guide explains how to set up the daily data synchronization from Google Cloud Storage.

## Overview

The application syncs data files from a Google Cloud Storage bucket (`public-timor`) daily via GitHub Actions. Files with the prefix `portal-` are downloaded, cleaned (prefix and versioning removed), and saved to `public/data/`.

## File Naming

Files in the GCS bucket are named with a prefix and versioning:
- `portal-aggregated_20260115132...`
- `portal-data_last_updated__202601...`
- `portal-indicators_grid__20260115...`

These are automatically cleaned to:
- `aggregated.json`
- `data_last_updated.json`
- `indicators_grid.json`

## Setup Instructions

### 1. Google Cloud Service Account

1. **Create a Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name it (e.g., `peskas-data-sync`)
   - Click "Create and Continue"

2. **Grant Storage Permissions:**
   - In the "Grant this service account access to project" step:
   - Add role: **Storage Object Viewer** (to read from the bucket)
   - Click "Continue" then "Done"

3. **Create and Download Key:**
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the JSON key file

### 2. GitHub Secrets Configuration

1. **Add the Service Account Key to GitHub:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GCP_SERVICE_ACCOUNT_KEY`
   - Value: Copy the **entire contents** of the downloaded JSON key file
   - Click "Add secret"

   **Important:** The value should be the complete JSON content, for example:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...",
     ...
   }
   ```

### 3. Local Development Setup

For local testing, you have two options:

#### Option A: Using .env File (Recommended for Local Development)

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and paste your service account JSON key:**
   - Open the downloaded JSON key file from Google Cloud Console
   - Copy the entire JSON content (it can be multi-line)
   - Paste it in `.env` after `GCP_SERVICE_ACCOUNT_KEY=`
   
   Example format in `.env`:
   ```bash
   GCP_SERVICE_ACCOUNT_KEY='
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     ...
   }
   '
   ```
   
   **Note:** The JSON can span multiple lines. Just make sure it's valid JSON.

3. **Run the sync script:**
   ```bash
   npm run fetch-data
   ```

   The script will automatically load variables from `.env` file and parse the multi-line JSON.

**Note:** The `.env` file is gitignored and will not be committed to the repository.

**Alternative:** If you prefer to use a file path instead, you can use:
```bash
GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

#### Option B: Using gcloud CLI

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate:
   ```bash
   gcloud auth application-default login
   ```
3. Run the sync script:
   ```bash
   npm run fetch-data
   ```

#### Option C: Using JSON Key as Environment Variable

```bash
export GCP_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
npm run fetch-data
```

## GitHub Actions Workflow

The workflow (`.github/workflows/sync-data.yml`) runs:
- **Daily at midnight UTC** (via cron schedule)
- **Manually** (via workflow_dispatch)

The workflow will:
1. Checkout the repository
2. Install dependencies
3. Sync data from GCS
4. Commit and push changes if any files were updated

## Testing

### Test Locally

```bash
# Install dependencies first
npm install

# Set credentials (choose one method above)
export GCP_SERVICE_ACCOUNT_KEY='...'  # or use GOOGLE_APPLICATION_CREDENTIALS

# Run the sync
npm run fetch-data
```

### Test GitHub Actions

1. Go to Actions tab in GitHub
2. Select "Daily Data Sync" workflow
3. Click "Run workflow" → "Run workflow"
4. Monitor the execution

## Troubleshooting

### Error: "Missing credentials"

- Ensure `GCP_SERVICE_ACCOUNT_KEY` secret is set in GitHub
- For local: ensure environment variable is set correctly
- Verify the JSON key is valid and complete

### Error: "Permission denied" or "Access denied"

- Verify the service account has **Storage Object Viewer** role
- Check that the bucket name is correct (`public-timor`)
- Ensure the service account has access to the bucket

### Error: "No files found"

- Verify files in the bucket have the `portal-` prefix
- Check bucket name is correct
- Verify service account has read permissions

### Files not updating

- Check GitHub Actions logs for errors
- Verify the workflow has `contents: write` permission
- Ensure `GITHUB_TOKEN` has write access (usually automatic)

## Security Notes

- **Never commit** the service account key file to the repository
- The key is stored as a GitHub secret (encrypted)
- The key only has read permissions (Storage Object Viewer)
- For production, consider using Workload Identity Federation for better security

## File Structure

After sync, `public/data/` should contain:
- `aggregated.json`
- `data_last_updated.json`
- `indicators_grid.json`
- `label_groups_list.json`
- `municipal_aggregated.json`
- `municipal_taxa.json`
- `nutrients_aggregated.json`
- `pars.json`
- `predicted_tracks.json`
- `summary_data.json`
- `taxa_aggregated.json`
- `taxa_names.json`
- `var_dictionary.json`
