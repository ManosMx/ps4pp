import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type PageRow = {
  id: number;
  title: string | null;
  slug: string | null;
  body: string | null;
  created_at: string;
};

export default function PagesAdmin() {
  const queryClient = useQueryClient();
  const [titleFilter, setTitleFilter] = useState("");
  const [slugFilter, setSlugFilter] = useState("");

  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingSlug, setEditingSlug] = useState("");
  const [editingBody, setEditingBody] = useState("");

  const {
    data: pages = [],
    isLoading,
    isError,
    error,
  } = useQuery<PageRow[], Error>({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("id, title, slug, body, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as PageRow[];
    },
  });

  const { mutateAsync: updatePage, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      id,
      title,
      slug,
      body,
    }: {
      id: number;
      title: string | null;
      slug: string | null;
      body: string | null;
    }) => {
      const { error } = await supabase
        .from("pages")
        .update({ title, slug, body })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    },
  });

  const { mutateAsync: deletePage, isPending: isDeleting } = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    },
  });

  const filteredPages = useMemo(() => {
    const normalizedTitle = titleFilter.trim().toLowerCase();
    const normalizedSlug = slugFilter.trim().toLowerCase();

    return pages.filter((page) => {
      const matchesTitle = normalizedTitle
        ? (page.title ?? "").toLowerCase().includes(normalizedTitle)
        : true;
      const matchesSlug = normalizedSlug
        ? (page.slug ?? "").toLowerCase().includes(normalizedSlug)
        : true;

      return matchesTitle && matchesSlug;
    });
  }, [titleFilter, slugFilter, pages]);

  const startEditing = (page: PageRow) => {
    setEditingPageId(page.id);
    setEditingTitle(page.title ?? "");
    setEditingSlug(page.slug ?? "");
    setEditingBody(page.body ?? "");
  };

  const stopEditing = () => {
    setEditingPageId(null);
    setEditingTitle("");
    setEditingSlug("");
    setEditingBody("");
  };

  const onUpdatePage = async (page: PageRow) => {
    const trimmedTitle = editingTitle.trim();
    const trimmedSlug = editingSlug.trim();

    if (!trimmedTitle) {
      toast.error("Title is required", { position: "bottom-right" });
      return;
    }

    if (!trimmedSlug) {
      toast.error("Slug is required", { position: "bottom-right" });
      return;
    }

    const slugConflict = pages.some(
      (p) =>
        p.id !== page.id && p.slug?.toLowerCase() === trimmedSlug.toLowerCase(),
    );

    if (slugConflict) {
      toast.error("Slug already in use", {
        description: "Choose a different slug.",
        position: "bottom-right",
      });
      return;
    }

    try {
      await updatePage({
        id: page.id,
        title: trimmedTitle,
        slug: trimmedSlug,
        body: editingBody.trim() || null,
      });

      stopEditing();

      toast.success("Page updated", {
        description: `"${trimmedTitle}" was saved.`,
        position: "bottom-right",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      toast.error("Failed to update page", {
        description: message,
        position: "bottom-right",
      });
    }
  };

  const onDeletePage = async (page: PageRow) => {
    if (!window.confirm(`Delete the page "${page.title ?? page.slug}"?`)) {
      return;
    }

    try {
      await deletePage({ id: page.id });

      if (editingPageId === page.id) {
        stopEditing();
      }

      toast.success("Page deleted", {
        description: `"${page.title ?? page.slug}" was removed.`,
        position: "bottom-right",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      toast.error("Failed to delete page", {
        description: message,
        position: "bottom-right",
      });
    }
  };

  const isBusy = isUpdating || isDeleting;

  const columns: ColumnDef<PageRow>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        if (editingPageId === row.original.id) {
          return (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Page title..."
              disabled={isUpdating}
            />
          );
        }

        return (
          <span className="block max-w-[16rem] truncate font-medium text-foreground">
            {row.original.title ?? "Untitled"}
          </span>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => {
        if (editingPageId === row.original.id) {
          return (
            <Input
              value={editingSlug}
              onChange={(e) => setEditingSlug(e.target.value)}
              placeholder="page-slug..."
              disabled={isUpdating}
            />
          );
        }

        return (
          <span className="block max-w-[14rem] truncate font-mono text-xs text-muted-foreground">
            {row.original.slug ?? "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "body",
      header: "Body",
      cell: ({ row }) => {
        if (editingPageId === row.original.id) {
          return (
            <textarea
              className="w-full min-h-[6rem] rounded-md border bg-transparent px-3 py-2 text-sm"
              value={editingBody}
              onChange={(e) => setEditingBody(e.target.value)}
              placeholder="Page content (HTML)..."
              disabled={isUpdating}
            />
          );
        }

        const body = row.original.body;

        if (!body) {
          return <span className="text-sm text-muted-foreground">Empty</span>;
        }

        return (
          <span className="block max-w-[20rem] truncate text-sm text-muted-foreground">
            {body.length > 80 ? `${body.slice(0, 80)}…` : body}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        return new Date(row.original.created_at).toLocaleString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const page = row.original;
        const isEditingCurrentRow = editingPageId === page.id;

        if (isEditingCurrentRow) {
          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => void onUpdatePage(page)}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={stopEditing}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => startEditing(page)}
              disabled={isBusy}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => void onDeletePage(page)}
              disabled={isBusy}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <div>Loading pages...</div>;
  }

  if (isError) {
    return <div>Failed to load pages: {error.message}</div>;
  }

  return (
    <Card className="w-3/4">
      <CardHeader className="flex flex-col gap-4">
        <CardTitle>Manage pages</CardTitle>
        <p className="text-sm text-muted-foreground">
          View, edit, and delete static pages. Slugs determine the URL path for
          each page.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            placeholder="Filter by title..."
          />

          <Input
            value={slugFilter}
            onChange={(e) => setSlugFilter(e.target.value)}
            placeholder="Filter by slug..."
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredPages}
          filterColumnId={null}
          initialPageSize={10}
          sortableColumnIds={["title", "slug", "created_at"]}
        />
      </CardContent>
    </Card>
  );
}
