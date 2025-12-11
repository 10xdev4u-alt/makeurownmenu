import { MongoClient, Db } from 'mongodb';

const uri = import.meta.env.VITE_MONGODB_URI as string;
const dbName = import.meta.env.VITE_MONGODB_DB_NAME as string || 'MakeUrOwnMenu';

if (!uri) {
  throw new Error('MongoDB URI is required. Please set VITE_MONGODB_URI in your .env file.');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
