import { Icon } from "leaflet";
import { Marker, useMap } from "react-leaflet";
import { MapPost } from "@/lib/queries/get-map-posts";

const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LocationMarker({
  post,
  onClick,
}: {
  post: MapPost;
  onClick?: () => void;
}) {
  const map = useMap();

  if (
    typeof post.location?.latitude !== "number" ||
    typeof post.location?.longitude !== "number"
  ) {
    return null;
  }

  return (
    <Marker
      position={{
        lat: post.location.latitude,
        lng: post.location.longitude,
      }}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          onClick?.();
          map.flyTo(e.latlng, map.getMaxZoom());
        },
      }}
    />
  );
}
