import { MongoClient, Db } from 'mongodb';

const uri = "mongodb+srv://makeurmnu:<$makeurownmenu_>@makeurownmenu.lwpthid.mongodb.net/?appName=makeurownmenu"; // IMPORTANT: Replace this with your actual MongoDB URI
const dbName = 'MakeUrOwnMenu';

if (!uri) {
  throw new Error('MongoDB URI is required. Please set VITE_MONGODB_URI in your .env file.');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
};
