import { TypedSupabaseClient } from "@/lib/types/types";

export default function getPostById(
  supabase: TypedSupabaseClient,
  postId: number,
) {
  return supabase
    .from("posts")
    .select(
      `
      *,
      location:locations_expanded (
        id,
        address,
        city,
        state,
        country,
        latitude,
        longitude
      ),
      tags (
        id,
        value,
        color
      )
    `,
    )
    .eq("id", postId)
    .eq("status", "published")
    .single();
}
