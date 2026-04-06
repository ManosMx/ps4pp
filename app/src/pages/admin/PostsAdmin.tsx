import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { POST_STATUS_OPTIONS, type PostStatus } from "@/lib/post-statuses";
import { supabase } from "@/lib/supabase/client";
import ComboboxMultiple from "@/components/ui/combobox-multiple";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import getAllTags, { TagOption } from "../api/get-all-tags";
import getPostsPaginated from "../api/get-paginated-posts";
import getPostsByAuthor from "../api/get-posts-by-author";
import { Button } from "@/components/ui/button";
import Link from "next/dist/client/link";

type Post = {
  id: number;
  title: string;
  body: string;
  status: string;
  created_at?: string;
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

function locationCell({ row }: { row: { original: Post } }) {
  const location = row.original.location;
  if (!location) return "N/A";

  const resolvedLocation = Array.isArray(location) ? location[0] : location;
  if (!resolvedLocation) return "N/A";

  const city = resolvedLocation.city ?? "Unknown city";
  const state = resolvedLocation.state ?? "Unknown state";
  const country = resolvedLocation.country ?? "Unknown country";

  return `${city}, ${state}, ${country}`;
}

function tagsCell({ row }: { row: { original: Post } }) {
  const tags = row.original.tags;
  if (!tags || tags.length === 0) return "N/A";
  return tags.map((tag) => tag.value).join(", ");
}

function bodyCell({ row }: { row: { original: Post } }) {
  const body = row.original.body;
  if (!body) return "N/A";
  return (
    <div className="max-h-24 overflow-hidden text-ellipsis">
      {body.length > 100 ? body.slice(0, 100) + "…" : body}
    </div>
  );
}

const myPostsColumns: ColumnDef<Post>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "body", header: "Body", cell: bodyCell },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "location", header: "Location", cell: locationCell },
  { accessorKey: "tags", header: "Tags", cell: tagsCell },
  {
    header: "Actions",
    cell: () => (
      <div className="flex space-x-2">
        <button className="px-2 py-1 text-sm text-primary-foreground bg-primary rounded-lg">
          Edit
        </button>
        <button className="px-2 py-1 text-sm text-white bg-destructive rounded-lg">
          Delete
        </button>
      </div>
    ),
  },
];

function MyPostsTable({ userId }: { userId: string }) {
  const [titleSearch, setTitleSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "">("");

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery<Post[], Error>({
    queryKey: ["my-posts", userId, titleSearch, statusFilter],
    queryFn: async () => {
      const { data, error } = await getPostsByAuthor(supabase, userId, {
        title: titleSearch,
        status: statusFilter || undefined,
      });
      if (error) throw error;
      return (data ?? []) as unknown as Post[];
    },
  });

  return (
    <Card className="w-3/4">
      <CardHeader className="flex flex-col gap-4">
        <CardTitle>My posts</CardTitle>
        <p className="text-sm text-muted-foreground">
          Posts you have created. Filter by title or status.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
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
            <option value="">All statuses</option>
            {POST_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div>
            <Link
              href="/new-post"
              className="flex items-center gap-2 rounded-md justify-center bg-primary px-5 py-2 text-sm font-medium !text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              Add post
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div>Loading posts...</div>
        ) : isError ? (
          <div>Failed to load posts: {error.message}</div>
        ) : (
          <DataTable
            columns={myPostsColumns}
            data={posts}
            filterColumnId={null}
            initialPageSize={10}
            sortableColumnIds={[]}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ModerationTable() {
  const queryClient = useQueryClient();
  const [titleSearch, setTitleSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);

  const selectedTagIds = useMemo(
    () => selectedTags.map((tag) => tag.id),
    [selectedTags],
  );

  const { data: availableTags = [] } = useQuery<TagOption[], Error>({
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
    queryKey: ["moderation-posts", titleSearch, selectedTagIds],
    queryFn: async () => {
      const { data, error } = await getPostsPaginated(supabase, 1, 50, {
        title: titleSearch,
        status: "pending",
        tagIds: selectedTagIds,
      });
      if (error) throw error;
      return (data ?? []) as unknown as Post[];
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      postId,
      newStatus,
    }: {
      postId: number;
      newStatus: "published" | "rejected";
    }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("posts")
        .update({ status: newStatus, moderator_id: session.user.id })
        .eq("id", postId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["moderation-posts", "map-posts"],
      });
    },
  });

  const moderationColumns: ColumnDef<Post>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "body", header: "Body", cell: bodyCell },
    { accessorKey: "location", header: "Location", cell: locationCell },
    { accessorKey: "tags", header: "Tags", cell: tagsCell },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-row gap-2">
          <Button
            disabled={isPending}
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              mutate({ postId: row.original.id, newStatus: "published" })
            }
          >
            Approve
          </Button>
          <Button
            disabled={isPending}
            type="button"
            size="sm"
            variant="destructive"
            onClick={() =>
              mutate({ postId: row.original.id, newStatus: "rejected" })
            }
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="w-3/4">
      <CardHeader className="flex flex-col gap-4">
        <CardTitle>Posts to moderate</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pending posts awaiting review. Approve or reject each submission.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={titleSearch}
            onChange={(event) => setTitleSearch(event.target.value)}
            placeholder="Search title..."
          />
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

        {isLoading ? (
          <div>Loading posts...</div>
        ) : isError ? (
          <div>Failed to load posts: {error.message}</div>
        ) : (
          <DataTable
            columns={moderationColumns}
            data={posts}
            filterColumnId={null}
            initialPageSize={10}
            sortableColumnIds={[]}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default function PostsAdmin() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  if (!userId) return <div>Loading...</div>;

  return (
    <>
      <MyPostsTable userId={userId} />
      <ModerationTable />
    </>
  );
}
