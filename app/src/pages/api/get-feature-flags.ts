import { TypedSupabaseClient } from "@/lib/types/types";

export type FeatureFlags = {
  tagsEnabled: boolean;
  usersEnabled: boolean;
  approvalEnabled: boolean;
};

export default function getFeatureFlags(supabase: TypedSupabaseClient) {
  return supabase.from("feature_flags").select("*").single();
}
