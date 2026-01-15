import { Storage } from '@google-cloud/storage';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

// Load environment variables from .env file (for local development)
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../public/data');

// Google Cloud Storage configuration
const BUCKET_NAME = 'public-timor';
const FILE_PREFIX = 'portal-';

/**
 * Extract the base filename from a GCS object name
 * Removes "portal-" prefix and versioning (everything after last underscore before date)
 * Example: "portal-aggregated_20260115132..." -> "aggregated"
 * Example: "portal-data_last_updated__202601..." -> "data_last_updated"
 */
function extractBaseName(gcsFileName) {
  // Remove the prefix
  let name = gcsFileName.replace(/^portal-/, '');
  
  // Remove versioning/date suffix (everything after the last underscore followed by digits)
  // Pattern: _YYYYMMDD... or __YYYYMMDD...
  name = name.replace(/[__]+(\d{8}.*)?$/, '');
  
  // Ensure it ends with .json (add if missing)
  if (!name.endsWith('.json')) {
    name = name + '.json';
  }
  
  return name;
}

/**
 * Download a file from GCS and save it locally
 */
async function downloadFile(storage, gcsFileName, localFileName) {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(gcsFileName);
  const localPath = path.join(DATA_DIR, localFileName);
  
  console.log(`Downloading ${gcsFileName} -> ${localFileName}`);
  
  await file.download({ destination: localPath });
  console.log(`✓ Downloaded ${localFileName}`);
}

/**
 * Main function to sync data from GCS bucket
 */
async function main() {
  // Initialize Google Cloud Storage
  // Credentials are read from GOOGLE_APPLICATION_CREDENTIALS env var or
  // from the JSON key file content in GCP_SERVICE_ACCOUNT_KEY env var
  let storage;
  
  if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
    // If key is provided as JSON string (supports both single-line and multi-line)
    let keyString = process.env.GCP_SERVICE_ACCOUNT_KEY.trim();
    
    // Remove surrounding quotes if present (from .env file)
    if ((keyString.startsWith('"') && keyString.endsWith('"')) ||
        (keyString.startsWith("'") && keyString.endsWith("'"))) {
      keyString = keyString.slice(1, -1);
    }
    
    // If the value doesn't start with {, dotenv might have only read part of it
    // Read the full value from the .env file directly
    if (!keyString.startsWith('{') || keyString.length < 50) {
      try {
        const envFilePath = path.resolve(__dirname, '../.env');
        const envFile = await fs.promises.readFile(envFilePath, 'utf-8');
        
        // Extract the full JSON value (handles multi-line)
        // Match from GCP_SERVICE_ACCOUNT_KEY= to the closing brace
        const match = envFile.match(/GCP_SERVICE_ACCOUNT_KEY\s*=\s*({[\s\S]*?})\s*$/m);
        if (match && match[1]) {
          keyString = match[1].trim();
        } else {
          // Try alternative: match everything after = until end or next variable
          const altMatch = envFile.match(/GCP_SERVICE_ACCOUNT_KEY\s*=\s*([\s\S]*?)(?=\n\w+\s*=|$)/);
          if (altMatch && altMatch[1]) {
            keyString = altMatch[1].trim();
            // Remove quotes if present
            if ((keyString.startsWith('"') && keyString.endsWith('"')) ||
                (keyString.startsWith("'") && keyString.endsWith("'"))) {
              keyString = keyString.slice(1, -1);
            }
          }
        }
      } catch (err) {
        console.warn('Could not read .env file directly, using environment variable:', err.message);
      }
    }
    
    // Parse the JSON (handles both single-line and multi-line)
    try {
      const credentials = JSON.parse(keyString);
      storage = new Storage({
        projectId: credentials.project_id,
        credentials: credentials,
      });
    } catch (error) {
      console.error('Error parsing GCP_SERVICE_ACCOUNT_KEY:', error.message);
      console.error('Key length:', keyString.length);
      console.error('First 200 chars:', keyString.substring(0, 200));
      console.error('Last 50 chars:', keyString.substring(Math.max(0, keyString.length - 50)));
      throw new Error('Invalid GCP_SERVICE_ACCOUNT_KEY format. Must be valid JSON.');
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // If key file path is provided
    storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  } else {
    // Try default credentials (for local development with gcloud auth)
    storage = new Storage();
  }

  try {
    // Ensure data directory exists
    await fs.promises.mkdir(DATA_DIR, { recursive: true });

    // List all files with the "portal-" prefix
    const bucket = storage.bucket(BUCKET_NAME);
    const [files] = await bucket.getFiles({ prefix: FILE_PREFIX });

    if (files.length === 0) {
      console.warn(`No files found with prefix "${FILE_PREFIX}" in bucket "${BUCKET_NAME}"`);
      return;
    }

        console.log(`Found ${files.length} file(s) with prefix "${FILE_PREFIX}"`);

        // Files to exclude (now handled in codebase or not used)
        const EXCLUDED_FILES = [
          'pars.json',           // Moved to config + i18n
          'taxa_names.json',     // Moved to i18n
          'var_dictionary.json', // Not used
          'indicators_grid.json', // Not used
          'label_groups_list.json' // Not used
        ];

        // Download each file (excluding pars.json and taxa_names.json)
        const downloadPromises = files
          .filter((file) => {
            const localFileName = extractBaseName(file.name);
            const shouldExclude = EXCLUDED_FILES.includes(localFileName);
            if (shouldExclude) {
              console.log(`Skipping ${localFileName} (handled in codebase)`);
            }
            return !shouldExclude;
          })
          .map(async (file) => {
            const gcsFileName = file.name;
            const localFileName = extractBaseName(gcsFileName);

            try {
              await downloadFile(storage, gcsFileName, localFileName);
            } catch (error) {
              console.error(`Error downloading ${gcsFileName}:`, error.message);
              throw error;
            }
          });

    await Promise.all(downloadPromises);
    
    console.log(`\n✓ Successfully synced ${files.length} file(s) to ${DATA_DIR}`);
    
  } catch (error) {
    console.error('Error syncing data from GCS:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
