import { MapContainer, TileLayer } from "react-leaflet";
import NewLocationMarker from "./NewLocationMarker";
import { LocationProvider } from "./context/LocationProvider";

export default function NewPostMap() {
  return (
    <LocationProvider>
      <div className="w-full h-full">
        <MapContainer
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full rounded-md"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <NewLocationMarker />
        </MapContainer>
      </div>
    </LocationProvider>
  );
}
