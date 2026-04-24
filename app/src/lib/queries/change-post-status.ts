import { TypedSupabaseClient } from "@/lib/types/types";

export default function changePostStatus(
  supabase: TypedSupabaseClient,
  status: string,
  postId: number,
) {
  return supabase.from("posts").update({ status }).eq("id", postId);
}
