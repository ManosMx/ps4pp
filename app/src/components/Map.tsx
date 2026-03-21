import { MapContainer, TileLayer } from "react-leaflet";
import NewLocationMarker from "./NewLocationMarker";
import { supabase } from "@/lib/supabase/client";
import LocationMarker from "./LocationMarker";
import { useQuery } from "@tanstack/react-query";
import getMapPosts, { type MapPost } from "@/pages/api/get-map-posts";
import { type TagOption } from "@/pages/api/get-all-tags";
import { useState } from "react";
import MapBoundsListener, { type MapViewBounds } from "./MapBoundsListener";
import MapTagsFilter from "./MapTagsFilter";

export default function Map() {
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [bounds, setBounds] = useState<MapViewBounds | null>(null);

  const selectedTagIds = selectedTags.map((tag) => tag.id);

  const { data: markerPosts = [] } = useQuery<MapPost[], Error>({
    queryKey: ["map-posts", selectedTagIds, bounds],
    queryFn: async () => {
      const { data, error } = await getMapPosts(supabase, {
        tagIds: selectedTagIds,
      });

      if (error) {
        throw error;
      }

      return (data ?? []) as unknown as MapPost[];
    },
    enabled: bounds !== null,
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
        center={[35.51217733300905, 24.020619392395023]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapBoundsListener onChange={setBounds} />
        <MapTagsFilter onChange={setSelectedTags} />
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
