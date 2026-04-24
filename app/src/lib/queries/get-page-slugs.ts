import { TypedSupabaseClient } from "@/lib/types/types";

export default function getPageSlugs(supabase: TypedSupabaseClient) {
  return supabase.from("pages").select("id, slug, title");
}
