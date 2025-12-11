// src/lib/d1.ts

// This file will provide the D1 client type for our functions.
// The D1 database is bound to `env.DB` in Cloudflare Pages Functions.

export type Env = {
  makeurownmenu_db: D1Database;
};