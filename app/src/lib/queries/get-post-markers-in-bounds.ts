import { MapViewBounds } from "@/components/MapBoundsListener";
import { TypedSupabaseClient } from "@/lib/types/types";

export default function getPostsInBounds(
  supabase: TypedSupabaseClient,
  bounds: MapViewBounds,
  tagIds: number[],
) {
  return supabase.rpc("get_post_markers_in_bounds", {
    south_bound: bounds.south,
    west_bound: bounds.west,
    north_bound: bounds.north,
    east_bound: bounds.east,
    tag_ids: tagIds.length ? tagIds : undefined,
  });
}
