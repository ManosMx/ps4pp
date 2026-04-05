import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { requireElevatedPage } from "@/lib/auth/server";
import AdminTabs from "./AdminTabs";

import { DataTable } from "@/components/DataTable";
import { POST_STATUS_OPTIONS, type PostStatus } from "@/lib/post-statuses";
import { supabase } from "@/lib/supabase/client";
import ComboboxMultiple from "@/components/ui/combobox-multiple";
import { Input } from "@/components/ui/input";

import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import getAllTags, { TagOption } from "../api/get-all-tags";
import getPostsPaginated from "../api/get-paginated-posts";

type Post = {
  id: number;
  title: string;
  body: string;
  status: string;
  location?: {
    id: number | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  tags?:
    | {
        id: number;
        value: string;
        color: string | null;
      }[]
    | null;
};

const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "body",
    header: "Body",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.location;
      if (!location) {
        return "N/A";
      }

      const resolvedLocation = Array.isArray(location) ? location[0] : location;
      if (!resolvedLocation) {
        return "N/A";
      }

      const city = resolvedLocation.city ?? "Unknown city";
      const state = resolvedLocation.state ?? "Unknown state";
      const country = resolvedLocation.country ?? "Unknown country";

      return `${city}, ${state}, ${country}`;
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags || tags.length === 0) {
        return "N/A";
      }
      return tags.map((tag) => tag.value).join(", ");
    },
  },
  {
    header: "Actions",
    cell: () => {
      return (
        <div className="flex space-x-2">
          <button className="px-2 py-1 text-sm text-primary-foreground bg-primary rounded-lg">
            Edit
          </button>
          <button className="px-2 py-1 text-sm text-white bg-destructive rounded-lg">
            Delete
          </button>
        </div>
      );
    },
  },
];

const page = 1;
const pageSize = 10;

function PostsTable() {
  const [titleSearch, setTitleSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "">("");
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);

  const selectedTagIds = useMemo(
    () => selectedTags.map((tag) => tag.id),
    [selectedTags],
  );

  const {
    data: availableTags = [],
    isLoading: isTagsLoading,
    isError: isTagsError,
    error: tagsError,
  } = useQuery<TagOption[], Error>({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await getAllTags(supabase);

      if (error) throw error;
      return data ?? [];
    },
  });

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery<Post[], Error>({
    queryKey: [
      "posts",
      page,
      pageSize,
      titleSearch,
      statusFilter,
      selectedTagIds,
    ],
    queryFn: async () => {
      const { data, error } = await getPostsPaginated(
        supabase,
        page,
        pageSize,
        {
          title: titleSearch,
          status: statusFilter,
          tagIds: selectedTagIds,
        },
      );
      if (error) throw error;
      return (data ?? []) as unknown as Post[];
    },
  });

  if (isTagsLoading) return <div>Loading filters...</div>;
  if (isTagsError) return <div>Failed to load tags: {tagsError.message}</div>;
  if (isLoading) return <div>Loading posts...</div>;
  if (isError) return <div>Failed to load posts: {error.message}</div>;

  return (
    <div className="container mx-auto space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          value={titleSearch}
          onChange={(event) => setTitleSearch(event.target.value)}
          placeholder="Search title..."
        />

        <select
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as PostStatus | "")
          }
        >
          <option value="">Status</option>
          {POST_STATUS_OPTIONS.map((statusOption) => (
            <option key={statusOption.value} value={statusOption.value}>
              {statusOption.label}
            </option>
          ))}
        </select>

        <div className="sm:col-span-2">
          <ComboboxMultiple
            value={selectedTags}
            items={availableTags}
            onValueChange={(value) =>
              setSelectedTags(value.map((tag) => ({ ...tag, color: null })))
            }
            placeholder="Filter by tags..."
            emptyText="No matching tags"
            className="w-full"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={posts}
        filterColumnId={null}
        initialPageSize={10}
        sortableColumnIds={[]}
      />
    </div>
  );
}

export default function PostsPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <main className="container mx-auto p-16 justify-center align-middle">
      <div className="space-y-6">
        <AdminTabs
          activeTab="posts"
          role={props.role}
          tagsEnabled={props.tagsEnabled}
        />
        <PostsTable />
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireElevatedPage(context, "/admin/posts");
};
