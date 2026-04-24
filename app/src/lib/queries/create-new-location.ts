import { TypedSupabaseClient } from "@/lib/types/types";
import addressReverseLookup from "./address-reverse-lookup";

type CreateNewLocationInput = {
  latitude: number;
  longitude: number;
};

export default async function createNewLocation(
  supabase: TypedSupabaseClient,
  input: CreateNewLocationInput,
) {
  const response = await addressReverseLookup({
    latitude: input.latitude,
    longitude: input.longitude,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to reverse geocode coordinates: ${response.statusText}`,
    );
  }

  const data = await response.json();

  return await supabase
    .rpc("insert_location", {
      lat: input.latitude,
      lng: input.longitude,
      p_address: data.address,
      p_city: data.city,
      p_state: data.state,
      p_country: data.country,
    })
    .single();
}
