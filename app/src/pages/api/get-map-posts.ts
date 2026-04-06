import type { PostStatus } from "@/lib/post-statuses";
import { TypedSupabaseClient } from "@/lib/types/types";

export type GetMapPostsFilters = {
  tagIds?: number[];
};

export type MapPost = {
  id: number;
  title: string;
  body: string;
  status: PostStatus;
  location: {
    id: number | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  tags: {
    id: number;
    value: string;
    color: string | null;
  }[];
};

export default function getMapPosts(
  supabase: TypedSupabaseClient,
  filters?: GetMapPostsFilters,
) {
  const matchingTagsSelection = filters?.tagIds?.length
    ? `,
      matching_tags:tags!inner (
        id
      )`
    : "";

  const selectQuery = `
    id,
    title,
    body,
    status,
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
    )${matchingTagsSelection}
  `;

  let query = supabase
    .from("posts")
    .select(selectQuery)
    .eq("status", "published");

  if (filters?.tagIds?.length) {
    query = query.in("matching_tags.id", filters.tagIds);
  }

  return query;
}
