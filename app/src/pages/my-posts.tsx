import LogoutButton from "@/components/LogoutButton";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getServerSessionWithRole, redirectToLogin } from "@/lib/auth/server";
import { POST_STATUS_OPTIONS, type PostStatus } from "@/lib/post-statuses";
import { supabase } from "@/lib/supabase/client";
import type { FeatureFlags } from "@/lib/types/types";
import getFeatureFlags from "@/pages/api/get-feature-flags";
import getPostsByAuthor from "@/pages/api/get-posts-by-author";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type MyPost = {
  id: number;
  title: string;
  body: string;
  status: string;
  created_at: string;
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

const defaultFeatureFlags: FeatureFlags = {
  tagsEnabled: false,
  usersEnabled: false,
  approvalEnabled: false,
};

const columns: ColumnDef<MyPost>[] = [
  {
    accessorKey: "title",
    header: "Title",
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

      const city = location.city ?? "Unknown city";
      const state = location.state ?? "Unknown state";
      const country = location.country ?? "Unknown country";

      return `${city}, ${state}, ${country}`;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString();
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags;

      if (!tags?.length) {
        return "N/A";
      }

      return tags.map((tag) => tag.value).join(", ");
    },
  },
];

export default function MyPostsPage({
  userId,
  role,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [titleSearch, setTitleSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "">("");

  const { data: featureFlags = defaultFeatureFlags } = useQuery<
    FeatureFlags,
    Error
  >({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await getFeatureFlags(supabase);

      if (error) {
        throw error;
      }

      if (!data) {
        return defaultFeatureFlags;
      }

      return {
        tagsEnabled: data.tagsEnabled,
        usersEnabled: data.usersEnabled,
        approvalEnabled: data.approvalEnabled,
      };
    },
  });

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery<MyPost[], Error>({
    queryKey: ["my-posts", userId, titleSearch, statusFilter],
    queryFn: async () => {
      const { data, error } = await getPostsByAuthor(supabase, userId, {
        title: titleSearch,
        status: statusFilter,
      });

      if (error) {
        throw error;
      }

      return (data ?? []) as unknown as MyPost[];
    },
  });

  const resolvedColumns = featureFlags.tagsEnabled
    ? columns
    : columns.filter((column) => column.id !== "tags");

  return (
    <div className="min-h-screen bg-muted px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {role}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              My Posts
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review the posts you have submitted, track their publication
              status, and keep your account session under your control.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground"
            >
              Back to map
            </Link>
            <LogoutButton />
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>Your submissions</CardTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              <div>
                <Button variant="default" asChild className="w-full">
                  <a href="/new-post">Add post</a>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <div>Loading your posts...</div> : null}
            {isError ? (
              <div>Failed to load your posts: {error.message}</div>
            ) : null}
            {!isLoading && !isError ? (
              <DataTable
                columns={resolvedColumns}
                data={posts}
                filterColumnId={null}
                initialPageSize={10}
                sortableColumnIds={[]}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { user, role } = await getServerSessionWithRole(context);

  if (!user) {
    return redirectToLogin(context, "/my-posts");
  }

  return {
    props: {
      userId: user.id,
      role: role ?? "USER",
    },
  };
};
