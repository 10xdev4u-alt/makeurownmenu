import { MongoClient, Db } from 'mongodb';

const uri = "mongodb+srv://makeurmnu:<$makeurownmenu_>@makeurownmenu.lwpthid.mongodb.net/?appName=makeurownmenu"; // IMPORTANT: Replace this with your actual MongoDB URI
const dbName = 'MakeUrOwnMenu';

if (!uri) {
  throw new Error('MongoDB URI is required. Please set VITE_MONGODB_URI in your .env file.');
}

const client = new MongoClient(uri);
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  console.log("connectToDatabase: Checking for cached DB...");
  if (cachedDb) {
    console.log("connectToDatabase: Returning cached DB.");
    return { client, db: cachedDb };
  }

  console.log("connectToDatabase: No cached DB found. Connecting to MongoDB...");
  await client.connect();
  console.log("connectToDatabase: MongoDB connection successful.");

  const db = client.db(dbName);
  cachedDb = db;

  console.log("connectToDatabase: Caching DB and returning.");
  return { client, db };
}
