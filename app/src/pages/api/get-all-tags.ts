import { TypedSupabaseClient } from "@/lib/types/types";

export type TagOption = {
  id: number;
  value: string;
};

export default function getAllTags(supabase: TypedSupabaseClient) {
  return supabase.from("tags").select("id, value").order("value", {
    ascending: true,
  });
}
