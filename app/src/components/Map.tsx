/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapContainer, TileLayer } from "react-leaflet";
import NewLocationMarker from "./NewLocationMarker";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import LocationMarker from "./LocationMarker";

type Post =
  | {
      id: any;
      title: any;
      body: any;
      status: any;
      location: {
        id: any;
        address: any;
        city: any;
        state: any;
        country: any;
        latitude: any;
        longitude: any;
      }[];
      tags: {
        id: any;
        value: any;
        color: any;
      }[];
    }[]
  | null;

export default function Map() {
  const [posts, setPosts] = useState<Post>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select(
        `
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
  `,
      )
      .then((result) => setPosts(result.data));
  }, []);

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
      {posts?.map((post) => {
        return (
          <LocationMarker
            key={post.id}
            position={{
              // @ts-expect-error
              lat: post.location?.latitude as number,
              // @ts-expect-error
              lng: post.location?.longitude as number,
            }}
          />
        );
      })}
    </MapContainer>
  );
}
