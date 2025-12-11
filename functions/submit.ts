// functions/submit.ts

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../src/lib/d1';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { user, menuFeedback } = body;

    if (!user || !menuFeedback) {
      return new Response(JSON.stringify({ error: 'Missing user or menuFeedback in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { name, email, room } = user;
    const createdAt = new Date().toISOString(); // D1 stores dates as TEXT

    const result = await env.makeurownmenu_db.prepare(
      'INSERT INTO menu_submissions (name, email, room, menu_feedback, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(name, email, room, JSON.stringify(menuFeedback), createdAt).run();

    return new Response(JSON.stringify({ success: true, insertedId: result.meta.last_row_id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error in onRequestPost:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

