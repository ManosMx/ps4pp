import { TypedSupabaseClient } from "@/lib/types/types";

export type GetPostsPaginatedFilters = {
  title?: string;
  status?: string;
  tagIds?: number[];
};

export default function getPostsPaginated(
  supabase: TypedSupabaseClient,
  page: number,
  pageSize: number,
  filters?: GetPostsPaginatedFilters,
) {
  const matchingTagsSelection = filters?.tagIds?.length
    ? `,
      matching_tags:tags!inner (
        id
      )`
    : "";

  const selectQuery = `
      id,
      title,
      body,
      status,
      location:locations_expanded (
        id,
        address,
        city,
        state,
        country,
        latitude,
        longitude
      ),
      tags (
        id,
        value,
        color
      )${matchingTagsSelection}
    `;

  let query = supabase
    .from("posts")
    .select(selectQuery, { count: "exact" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters?.title?.trim()) {
    query = query.ilike("title", `%${filters.title.trim()}%`);
  }

  if (filters?.status?.trim()) {
    query = query.eq("status", filters.status.trim());
  }

  if (filters?.tagIds?.length) {
    query = query.in("matching_tags.id", filters.tagIds);
  }

  return query;
}

export type SearchFormValues = {
  title: string;
  status: string;
  tags: string[];
};
