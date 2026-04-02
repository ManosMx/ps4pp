import type { PostStatus } from "@/lib/post-statuses";
import type { Tables, TablesInsert } from "@/lib/types/database.types";
import { TypedSupabaseClient } from "@/lib/types/types";

export type CreateNewPostInput = {
  title: string;
  body: string;
  status?: PostStatus;
  locationId?: number | null;
  moderatorId?: string | null;
  tagIds?: number[];
};

export default async function createNewPost(
  supabase: TypedSupabaseClient,
  input: CreateNewPostInput,
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: null,
      error: authError ?? new Error("You must be logged in to create a post."),
    };
  }

  const postToInsert: TablesInsert<"posts"> = {
    title: input.title.trim(),
    body: input.body.trim(),
    status: input.status ?? "pending",
    location_id: input.locationId ?? null,
    author_id: user.id,
    moderator_id: input.moderatorId ?? null,
  };

  const { data: post, error } = await supabase
    .from("posts")
    .insert(postToInsert)
    .select(
      "id, title, body, status, location_id, author_id, moderator_id, created_at",
    )
    .single();

  if (error || !post) {
    return { data: post, error };
  }

  const uniqueTagIds = [...new Set(input.tagIds ?? [])];

  if (uniqueTagIds.length > 0) {
    const postTagsToInsert: TablesInsert<"post_tags">[] = uniqueTagIds.map(
      (tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      }),
    );

    const { error: postTagsError } = await supabase
      .from("post_tags")
      .insert(postTagsToInsert);

    if (postTagsError) {
      return {
        data: post as Tables<"posts">,
        error: postTagsError,
      };
    }
  }

  return {
    data: post as Tables<"posts">,
    error: null,
  };
}
