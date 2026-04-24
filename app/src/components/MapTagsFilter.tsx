import { supabase } from "@/lib/supabase/client";
import { FeatureFlags } from "@/lib/types/types";
import getAllTags, { TagOption } from "@/lib/queries/get-all-tags";
import getFeatureFlags from "@/lib/queries/get-feature-flags";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useReducer } from "react";
import { Button } from "./ui/button";

const defaultFeatureFlags: FeatureFlags = {
  tagsEnabled: false,
  usersEnabled: false,
  approvalEnabled: false,
};

const calculateButtonsPerRow = (
  containerWidth: number,
  buttonWidth: number,
  gap: number,
) => {
  return Math.floor((containerWidth + gap) / (buttonWidth + gap));
};

const reducer = (state: TagOption[], action: TagOption) => {
  if (state.find((tag) => tag.id === action.id)) {
    return state.filter((tag) => tag.id !== action.id);
  } else {
    return [...state, action];
  }
};

const initialState: TagOption[] = [];

export default function MapTagsFilter({
  onChange,
}: {
  onChange?: (selectedTags: TagOption[]) => void;
}) {
  const [selectedTags, setSelectedTags] = useReducer(reducer, initialState);

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

  useEffect(() => {
    if (onChange) {
      onChange(selectedTags);
    }
  }, [selectedTags, onChange]);

  if (!featureFlags?.tagsEnabled) {
    return null;
  }

  return (
    <div
      className="width-max-content max-w-[50%] absolute top-4 right-4 flex flex-wrap items-center rounded gap-4"
      style={{ zIndex: 1000 }}
    >
      {availableTags.map((tag) => (
        <Button
          key={tag.id}
          className="w-32"
          onClick={() => setSelectedTags(tag)}
          style={{ backgroundColor: tag.color ?? undefined }}
        >
          {tag.value}
        </Button>
      ))}
      <MoreTagsButton />
    </div>
  );
}

function MoreTagsButton() {
  return <Button className="w-28">Filters</Button>;
}
