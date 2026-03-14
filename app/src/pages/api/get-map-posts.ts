import type { PostStatus } from "@/lib/post-statuses";
import { TypedSupabaseClient } from "@/lib/types/types";

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

const MAP_POSTS_SELECT = `
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
  )
`;

export default function getMapPosts(supabase: TypedSupabaseClient) {
  return supabase.from("posts").select(MAP_POSTS_SELECT);
}
