import { createBrowserClient } from "@supabase/ssr";

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Empty string makes @supabase/ssr resolve all API paths relative to the
// browser's own origin, so Caddy handles routing without a hardcoded IP.
export const supabase = createBrowserClient("", supabaseKey);
