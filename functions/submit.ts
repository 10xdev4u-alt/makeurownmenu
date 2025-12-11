// functions/submit.ts

import { connectToDatabase } from '../src/lib/mongodb';
import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequestGet: PagesFunction = async (context) => {
  return new Response(JSON.stringify({ message: "GET request received" }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
