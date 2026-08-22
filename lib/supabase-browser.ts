"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/env";

let client: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient() {
  if (!client) {
    const { url, publishableKey } = getSupabaseEnv();
    client = createBrowserClient<Database>(url, publishableKey);
  }
  return client;
}
