import { Icon, LatLng, LatLngExpression } from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";
import { useLocation } from "./context/LocationProvider";

const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LocationMarker({
  position,
}: {
  position: LatLngExpression;
}) {
  const map = useMap();
  const { setLocation } = useLocation();

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          setLocation({
            location: { lat: e.latlng.lat, lng: e.latlng.lng },
            action: "view",
          });
          map.flyTo(e.latlng, map.getZoom());
        },
      }}
    >
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  );
}
