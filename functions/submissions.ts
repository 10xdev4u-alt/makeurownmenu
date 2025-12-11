// functions/submissions.ts

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../src/lib/d1';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    let query = 'SELECT * FROM menu_submissions';
    const params: (string | number)[] = [];

    if (email) {
      query += ' WHERE email = ?';
      params.push(email);
    }
    query += ' ORDER BY created_at DESC';

    const { results } = await env.makeurownmenu_db.prepare(query).bind(...params).all();

    // D1 returns created_at as TEXT, convert to Date for consistency if needed by frontend
    const submissions = results.map((submission: any) => ({
      ...submission,
      created_at: new Date(submission.created_at),
      menu_feedback: JSON.parse(submission.menu_feedback) // Parse JSON string back to object
    }));

    return new Response(JSON.stringify(submissions), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error in onRequestGet:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}