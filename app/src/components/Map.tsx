import { MapContainer, TileLayer } from "react-leaflet";
import NewLocationMarker from "./NewLocationMarker";
import { supabase } from "@/lib/supabase/client";
import LocationMarker from "./LocationMarker";
import { useQuery } from "@tanstack/react-query";
import getMapPosts, { type MapPost } from "@/pages/api/get-map-posts";
import getAllTags, { type TagOption } from "@/pages/api/get-all-tags";
import { useState } from "react";
import getFeatureFlags from "@/pages/api/get-feature-flags";

export default function Map() {
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);

  const { data: featureFlags } = useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await getFeatureFlags(supabase);

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const selectedTagIds = selectedTags.map((tag) => tag.id);

  const { data: availableTags = [] } = useQuery<TagOption[], Error>({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await getAllTags(supabase);

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    enabled: !!featureFlags?.tagsEnabled,
  });

  const { data: markerPosts = [] } = useQuery<MapPost[], Error>({
    queryKey: ["map-posts", selectedTagIds],
    queryFn: async () => {
      const { data, error } = await getMapPosts(supabase, {
        tagIds: selectedTagIds,
      });

      if (error) {
        throw error;
      }

      return (data ?? []) as unknown as MapPost[];
    },
    select: (posts) =>
      posts.filter((post) => {
        const latitude = post.location?.latitude;
        const longitude = post.location?.longitude;

        return typeof latitude === "number" && typeof longitude === "number";
      }),
  });

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[35.5114499, 24.0224848]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <NewLocationMarker />
        {markerPosts.map((post) => {
          const latitude = post.location?.latitude;
          const longitude = post.location?.longitude;

          if (typeof latitude !== "number" || typeof longitude !== "number") {
            return null;
          }

          return (
            <LocationMarker
              key={post.id}
              position={{
                lat: latitude,
                lng: longitude,
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
