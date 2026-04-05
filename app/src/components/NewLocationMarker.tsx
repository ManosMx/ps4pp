import { Icon } from "leaflet";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { useLocation } from "./context/LocationProvider";

const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function NewLocationMarker({
  onClick,
}: {
  onClick?: () => void;
}) {
  const { setLocation, location, action } = useLocation();

  const map = useMapEvents({
    click(e) {
      setLocation({
        location: { lat: e.latlng.lat, lng: e.latlng.lng },
        action: "create",
      });
      map.flyTo(e.latlng, map.getZoom());
      if (onClick) {
        onClick();
      }
    },
    locationerror(e) {
      console.error(e);
    },
  });

  if (!location || action !== "create") {
    return null;
  }

  return (
    <Marker position={{ lat: location.lat, lng: location.lng }} icon={icon}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  );
}
