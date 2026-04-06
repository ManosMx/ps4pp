import { TypedSupabaseClient } from "@/lib/types/types";

export default function getFeatureFlags(supabase: TypedSupabaseClient) {
  return supabase
    .from("feature_flags")
    .select()
    .eq("id", true)
    .maybeSingle()
    .setHeader("Accept", "application/vnd.pgrst.object+json");
}
