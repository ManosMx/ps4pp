import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { LocationProvider } from "@/components/context/LocationProvider";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <LocationProvider>
      <div style={{ height: "100vh", width: "100vw" }}>
        <Map />
      </div>
    </LocationProvider>
  );
}
