import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { supabase } from "@/lib/supabase/client";
import LocationMarker from "./LocationMarker";
import { useQuery } from "@tanstack/react-query";
import getMapPosts, { type MapPost } from "@/pages/api/get-map-posts";
import { type TagOption } from "@/pages/api/get-all-tags";
import { useState } from "react";
import MapBoundsListener, { type MapViewBounds } from "./MapBoundsListener";
import MapTagsFilter from "./MapTagsFilter";
import SideBar from "./Sidebar";
import MapMarker from "./MapMarker";

export default function Map() {
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [bounds, setBounds] = useState<MapViewBounds | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

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

  const onClickMarker = (postId: number) => {
    setSidebarOpen(true);
    setSelectedPostId(postId);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <MapContainer
          center={[35.51217733300905, 24.020619392395023]}
          zoom={14}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <ZoomControl position="bottomleft" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapBoundsListener onChange={setBounds} />
          {markerPosts.map((post) => (
            <LocationMarker
              key={post.id}
              post={post}
              onClick={() => onClickMarker(post.id)}
            />
          ))}
        </MapContainer>
      </div>
      <SideBar
        postId={selectedPostId ?? 1}
        isOpen={sidebarOpen}
        close={() => setSidebarOpen(false)}
      />
    </div>
  );
}
