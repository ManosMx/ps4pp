import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapUserLocation() {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, {
          duration: 1.5,
        });
      },
      () => {
        // Permission denied or unavailable — keep the default center.
      },
    );
  }, [map]);

  return null;
}
