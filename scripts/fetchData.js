import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const MONGO_URI = process.env.MONGODB_URI; // TODO: provide MongoDB connection string via secrets
const DB_NAME = process.env.MONGODB_DB; // TODO: provide database name via secrets
const COLLECTIONS = (process.env.MONGODB_COLLECTIONS || '')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean); // TODO: provide comma-separated collection names via secrets

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../public/data');

async function fetchCollection(db, name) {
  const data = await db.collection(name).find({}).toArray();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function main() {
  if (!MONGO_URI || !DB_NAME || COLLECTIONS.length === 0) {
    throw new Error('Missing MongoDB configuration.');
  }

  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    for (const name of COLLECTIONS) {
      await fetchCollection(db, name);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Error fetching data', err);
  process.exit(1);
});
