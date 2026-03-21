import { supabase } from "@/lib/supabase/client";
import { FeatureFlags } from "@/lib/types/types";
import getAllTags, { TagOption } from "@/pages/api/get-all-tags";
import getFeatureFlags from "@/pages/api/get-feature-flags";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const defaultFeatureFlags: FeatureFlags = {
  tagsEnabled: false,
  usersEnabled: false,
  approvalEnabled: false,
};

export default function MapTagsFilter({
  onChange,
}: {
  onChange?: (selectedTags: TagOption[]) => void;
}) {
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);

  const { data: featureFlags } = useQuery<FeatureFlags, Error>({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await getFeatureFlags(supabase);

      if (error) {
        throw error;
      }

      return data ?? defaultFeatureFlags;
    },
  });

  const { data: availableTags = [] } = useQuery<TagOption[], Error>({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await getAllTags(supabase);

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    enabled: featureFlags?.tagsEnabled ?? false,
  });

  return <div></div>;
}
