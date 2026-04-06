import L from "leaflet";
import { Marker, useMap } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPinIcon, AlertTriangleIcon } from "lucide-react";

type MarkerVariant = "info" | "alert";

interface MapMarkerProps {
  position: { lat: number; lng: number };
  label: string;
  variant?: MarkerVariant;
  onClick?: () => void;
}

const variantStyles: Record<
  MarkerVariant,
  { bg: string; iconColor: string; Icon: typeof MapPinIcon }
> = {
  info: {
    bg: "#005249",
    iconColor: "#FF5722",
    Icon: MapPinIcon,
  },
  alert: {
    bg: "#FF5722",
    iconColor: "#FFFFFF",
    Icon: AlertTriangleIcon,
  },
};

function createMarkerIcon(label: string, variant: MarkerVariant) {
  const { bg, iconColor, Icon } = variantStyles[variant];

  const html = renderToStaticMarkup(
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: bg,
        color: "#fff",
        fontSize: "13px",
        fontWeight: 500,
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "6px 14px 6px 10px",
        borderRadius: "9999px",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        lineHeight: 1,
      }}
    >
      <Icon size={16} color={iconColor} fill={iconColor} strokeWidth={0} />
      {label}
    </div>,
  );

  return L.divIcon({
    html,
    className: "",
    iconAnchor: [0, 0],
  });
}

export default function MapMarker({
  position,
  label,
  variant = "info",
  onClick,
}: MapMarkerProps) {
  const map = useMap();
  const icon = createMarkerIcon(label, variant);

  return (
    <Marker
      position={[position.lat, position.lng]}
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
