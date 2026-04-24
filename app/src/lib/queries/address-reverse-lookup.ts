type AddressReverseLookupProps = {
  latitude: number;
  longitude: number;
};

type GeocodingResponse = {
  type: "FeatureCollection";
  geocoding: {
    version: string;
    attribution: string;
    licence: string;
    query: string;
  };
  features: Feature[]; // array of features
};

type Feature = {
  type: "Feature";
  properties: {
    geocoding: {
      place_id: string;
      osm_type: string;
      osm_id: string;
      type: string;
      accuracy: number;
      label: string;
      name: string | null;
      housenumber?: string;
      street?: string;
      postcode?: string;
      county?: string;
      country?: string;
      admin?: {
        level7?: string;
        level4?: string;
        level2?: string;
        [key: string]: string | undefined;
      };
    };
  };
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
};

export default async function addressReverseLookup({
  latitude,
  longitude,
}: AddressReverseLookupProps) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&format=geocodejson&layer=address`,
  );

  if (!response.ok) {
    return new Response(
      JSON.stringify({
        error: await response.text(),
      }),
      {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const data: Partial<GeocodingResponse> = await response.json();

  if (!data || !data.features || data.features.length === 0) {
    return new Response(
      JSON.stringify({
        error: "No address information found for the given coordinates",
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const address =
    data.features[0].properties.geocoding.label || "Unknown address";
  const city = data.features[0].properties.geocoding.admin?.level7 || null;
  const state = data.features[0].properties.geocoding.admin?.level4 || null;
  const country = data.features[0].properties.geocoding.admin?.level2 || null;

  return new Response(
    JSON.stringify({
      address,
      city,
      state,
      country,
      latitude,
      longitude,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
