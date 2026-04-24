import { TypedSupabaseClient } from "@/lib/types/types";

export default function getPageBySlug(
  supabase: TypedSupabaseClient,
  slug: string,
) {
  return supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
}
