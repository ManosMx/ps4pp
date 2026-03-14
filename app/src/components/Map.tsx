import { MapContainer, TileLayer } from "react-leaflet";
import NewLocationMarker from "./NewLocationMarker";
import { supabase } from "@/lib/supabase/client";
import LocationMarker from "./LocationMarker";
import { useQuery } from "@tanstack/react-query";
import getMapPosts, { type MapPost } from "@/pages/api/get-map-posts";

export default function Map() {
  const { data: posts = [] } = useQuery<MapPost[], Error>({
    queryKey: ["map-posts"],
    queryFn: async () => {
      const { data, error } = await getMapPosts(supabase);

      if (error) {
        throw error;
      }

      return (data ?? []) as MapPost[];
    },
  });

  const markerPosts = posts.filter((post) => {
    const latitude = post.location?.latitude;
    const longitude = post.location?.longitude;

    return typeof latitude === "number" && typeof longitude === "number";
  });

  return (
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
  );
}
