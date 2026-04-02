import { TypedSupabaseClient } from "@/lib/types/types";

export default function getPostById(
  supabase: TypedSupabaseClient,
  postId: number,
) {
  return supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .eq("status", "published")
    .single();
}
