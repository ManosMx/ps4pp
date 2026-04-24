import { TypedSupabaseClient } from "@/lib/types/types";

export type GetPostsByAuthorFilters = {
  title?: string;
  status?: string;
};

export default function getPostsByAuthor(
  supabase: TypedSupabaseClient,
  authorId: string,
  filters?: GetPostsByAuthorFilters,
) {
  let query = supabase.from("posts").select(
    `
      id,
      title,
      body,
      status,
      created_at,
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
  );

  query = query.eq("author_id", authorId).order("created_at", {
    ascending: false,
  });

  if (filters?.title?.trim()) {
    query = query.ilike("title", `%${filters.title.trim()}%`);
  }

  if (filters?.status?.trim()) {
    query = query.eq("status", filters.status.trim());
  }

  return query;
}
