import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

export type MapViewBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export default function MapBoundsListener({
  onChange,
}: {
  onChange: (bounds: MapViewBounds) => void;
}) {
  const map = useMapEvents({
    moveend() {
      const bounds = map.getBounds();

      onChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
    zoomend() {
      const bounds = map.getBounds();

      onChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    // Trigger initial bounds calculation on mount
    onChange({
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    });
  }, [map, onChange]);

  return null;
}
