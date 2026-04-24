import { TypedSupabaseClient } from "@/lib/types/types";

export default function getPageById(
  supabase: TypedSupabaseClient,
  pageId: number,
) {
  return supabase.from("pages").select("*").eq("id", pageId).single();
}
