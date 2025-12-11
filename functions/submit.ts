// functions/submit.ts

import { connectToDatabase } from '../src/lib/mongodb';
import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { request } = context;
    const body = await request.json();
    const { user, menuFeedback } = body;

    if (!user || !menuFeedback) {
      return new Response(JSON.stringify({ error: 'Missing user or menuFeedback in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('menu_submissions').insertOne({
      name: user.name,
      email: user.email,
      room: user.room,
      menu_feedback: menuFeedback,
      created_at: new Date(),
    });

    return new Response(JSON.stringify({ success: true, insertedId: result.insertedId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
