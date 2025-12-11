// functions/submissions.ts

import { connectToDatabase } from '../src/lib/mongodb';
import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequestGet: PagesFunction = async (context) => {
  console.log("onRequestGet: Function start");
  try {
    const { request } = context;
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    console.log(`onRequestGet: Email parameter: ${email}`);

    console.log("onRequestGet: Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("onRequestGet: Database connection successful.");

    const collection = db.collection('menu_submissions');

    let query = {};
    if (email) {
      query = { email: email };
    }
    console.log("onRequestGet: Executing query:", query);

    const submissions = await collection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    console.log(`onRequestGet: Found ${submissions.length} submissions.`);

    return new Response(JSON.stringify(submissions), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("onRequestGet: Caught error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}