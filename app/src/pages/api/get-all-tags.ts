import { TypedSupabaseClient } from "@/lib/types/types";

export type TagOption = {
  id: number;
  value: string;
  color: string | null;
};

export default function getAllTags(supabase: TypedSupabaseClient) {
  return supabase.from("tags").select("id, value, color").order("id", {
    ascending: true,
  });
}
