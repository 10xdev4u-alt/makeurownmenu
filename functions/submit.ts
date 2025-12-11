// functions/submit.ts

import { connectToDatabase } from '../src/lib/mongodb';
import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequestPost: PagesFunction = async (context) => {
  console.log("onRequestPost: Function start");
  try {
    const { request } = context;
    const body = await request.json();
    console.log("onRequestPost: Request body:", body);
    const { user, menuFeedback } = body;

    if (!user || !menuFeedback) {
      console.error("onRequestPost: Missing user or menuFeedback in request body");
      return new Response(JSON.stringify({ error: 'Missing user or menuFeedback in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log("onRequestPost: Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("onRequestPost: Database connection successful.");

    const submissionData = {
      name: user.name,
      email: user.email,
      room: user.room,
      menu_feedback: menuFeedback,
      created_at: new Date(),
    };
    console.log("onRequestPost: Inserting submission data:", submissionData);

    const result = await db.collection('menu_submissions').insertOne(submissionData);
    console.log("onRequestPost: Insertion successful. Inserted ID:", result.insertedId);

    return new Response(JSON.stringify({ success: true, insertedId: result.insertedId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("onRequestPost: Caught error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
