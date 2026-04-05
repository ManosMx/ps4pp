import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import NewLocationMarker from "./NewLocationMarker";
import { LocationProvider } from "./context/LocationProvider";
import PostForm from "./PostForm";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPostMap() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <LocationProvider>
      <div className="flex h-screen">
        <div className="flex-1">
          <MapContainer
            center={[35.51217733300905, 24.020619392395023]}
            zoom={13}
            zoomControl={false}
            className="w-full h-full"
          >
            <Link
              href="/my-posts"
              className="z-1000 absolute top-4 left-4 flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium !text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <ZoomControl position="bottomleft" />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <NewLocationMarker onClick={() => setIsOpen(true)} />
          </MapContainer>
        </div>
        <aside
          aria-hidden={!isOpen}
          className={cn(
            "relative h-full shrink-0 overflow-hidden border-l bg-white shadow-2xl transition-[width,border-color,box-shadow] duration-300 ease-out",
            isOpen
              ? "w-1/3 border-border"
              : "w-0 border-transparent shadow-none",
          )}
        >
          {/* Sidebar content goes here */}
          <PostForm />
        </aside>
      </div>
    </LocationProvider>
  );
}
