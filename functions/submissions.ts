// functions/submissions.ts

import { connectToDatabase } from '../src/lib/mongodb';
import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request } = context;
    const url = new URL(request.url);
    const email = url.searchParams.get('email'); // Get email from query parameter

    const { db } = await connectToDatabase();
    const collection = db.collection('menu_submissions');

    let query = {};
    if (email) {
      query = { email: email }; // Filter by email if provided
    }

    const submissions = await collection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    return new Response(JSON.stringify(submissions), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}