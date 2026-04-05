import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdminPage } from "@/lib/auth/server";
import { supabase } from "@/lib/supabase/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import AdminTabs from "./AdminTabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";

type TagRow = {
  id: number;
  value: string;
  color: string | null;
  created_at: string;
};

export default function TagsPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const queryClient = useQueryClient();
  const [tagValue, setTagValue] = useState("");
  const [tagColor, setTagColor] = useState("#005249");
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingColor, setEditingColor] = useState("#005249");

  const {
    data: tags = [],
    isLoading,
    isError,
    error,
  } = useQuery<TagRow[], Error>({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, value, color, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as TagRow[];
    },
  });

  const { mutateAsync: createTag, isPending: isCreating } = useMutation({
    mutationFn: async ({
      value,
      color,
    }: {
      value: string;
      color: string | null;
    }) => {
      const { error } = await supabase.from("tags").insert({
        value,
        color,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-tags"] }),
        queryClient.invalidateQueries({ queryKey: ["tags"] }),
      ]);
    },
  });

  const { mutateAsync: updateTag, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      id,
      value,
      color,
    }: {
      id: number;
      value: string;
      color: string | null;
    }) => {
      const { error } = await supabase
        .from("tags")
        .update({ value, color })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-tags"] }),
        queryClient.invalidateQueries({ queryKey: ["tags"] }),
      ]);
    },
  });

  const { mutateAsync: deleteTag, isPending: isDeleting } = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-tags"] }),
        queryClient.invalidateQueries({ queryKey: ["tags"] }),
      ]);
    },
  });

  const tagNameExists = (value: string, excludedId?: number) => {
    const normalizedValue = value.trim().toLowerCase();

    return tags.some((tag) => {
      if (excludedId !== undefined && tag.id === excludedId) {
        return false;
      }

      return tag.value.trim().toLowerCase() === normalizedValue;
    });
  };

  const startEditingTag = (tag: TagRow) => {
    setEditingTagId(tag.id);
    setEditingValue(tag.value);
    setEditingColor(tag.color ?? "#005249");
  };

  const stopEditingTag = () => {
    setEditingTagId(null);
    setEditingValue("");
    setEditingColor("#005249");
  };

  const onCreateTag = async () => {
    const normalizedValue = tagValue.trim();

    if (!normalizedValue) {
      toast.error("Tag name is required", {
        position: "bottom-right",
      });
      return;
    }

    if (tagNameExists(normalizedValue)) {
      toast.error("Tag name already exists", {
        description: "Choose a different tag name before creating it.",
        position: "bottom-right",
      });
      return;
    }

    try {
      await createTag({
        value: normalizedValue,
        color: tagColor.trim() || null,
      });

      setTagValue("");
      setTagColor("#005249");

      toast.success("Tag created", {
        description: `${normalizedValue} is now available.`,
        position: "bottom-right",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      toast.error("Failed to create tag", {
        description: message,
        position: "bottom-right",
      });
    }
  };

  const onUpdateTag = async (tag: TagRow) => {
    const normalizedValue = editingValue.trim();

    if (!normalizedValue) {
      toast.error("Tag name is required", {
        position: "bottom-right",
      });
      return;
    }

    if (tagNameExists(normalizedValue, tag.id)) {
      toast.error("Tag name already exists", {
        description: "Choose a different tag name before saving.",
        position: "bottom-right",
      });
      return;
    }

    try {
      await updateTag({
        id: tag.id,
        value: normalizedValue,
        color: editingColor.trim() || null,
      });

      stopEditingTag();

      toast.success("Tag updated", {
        description: `${normalizedValue} was updated successfully.`,
        position: "bottom-right",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      toast.error("Failed to update tag", {
        description: message,
        position: "bottom-right",
      });
    }
  };

  const onDeleteTag = async (tag: TagRow) => {
    if (!window.confirm(`Delete the tag \"${tag.value}\"?`)) {
      return;
    }

    try {
      await deleteTag({ id: tag.id });

      if (editingTagId === tag.id) {
        stopEditingTag();
      }

      toast.success("Tag deleted", {
        description: `${tag.value} was removed successfully.`,
        position: "bottom-right",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      toast.error("Failed to delete tag", {
        description: message,
        position: "bottom-right",
      });
    }
  };

  const columns: ColumnDef<TagRow>[] = [
    {
      accessorKey: "value",
      header: "Tag",
      cell: ({ row }) => {
        const isEditingCurrentRow = editingTagId === row.original.id;

        if (!isEditingCurrentRow) {
          return row.original.value;
        }

        return (
          <Input
            value={editingValue}
            onChange={(event) => setEditingValue(event.target.value)}
            placeholder="Tag name..."
            disabled={isUpdating}
          />
        );
      },
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => {
        const isEditingCurrentRow = editingTagId === row.original.id;
        const color = row.original.color;

        if (isEditingCurrentRow) {
          return (
            <Input
              type="color"
              value={editingColor}
              onChange={(event) => setEditingColor(event.target.value)}
              className="h-10 w-20 cursor-pointer"
              disabled={isUpdating}
            />
          );
        }

        if (!color) {
          return (
            <span className="text-sm text-muted-foreground">No color</span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-xs text-muted-foreground">
              {color}
            </span>
          </div>
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
        const tag = row.original;
        const isEditingCurrentRow = editingTagId === tag.id;
        const isBusy = isCreating || isUpdating || isDeleting;

        if (isEditingCurrentRow) {
          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  void onUpdateTag(tag);
                }}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={stopEditingTag}
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
              onClick={() => startEditingTag(tag)}
              disabled={isBusy}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                void onDeleteTag(tag);
              }}
              disabled={isBusy}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <main className="container mx-auto p-16 justify-center align-middle">
      <div className="space-y-6">
        <AdminTabs
          activeTab="tags"
          role={props.role}
          tagsEnabled={props.tagsEnabled}
        />
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Tags</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review existing tags and create new ones for the rest of the app.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_10rem]">
              <Input
                value={tagValue}
                onChange={(event) => setTagValue(event.target.value)}
                placeholder="New tag name..."
                disabled={isCreating}
              />

              <Input
                type="color"
                value={tagColor}
                onChange={(event) => setTagColor(event.target.value)}
                className="h-10 w-full cursor-pointer"
                disabled={isCreating}
              />

              <Button
                type="button"
                onClick={() => {
                  void onCreateTag();
                }}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create tag"}
              </Button>
            </div>

            {isLoading ? <div>Loading tags...</div> : null}
            {isError ? <div>Failed to load tags: {error.message}</div> : null}

            {!isLoading && !isError ? (
              <DataTable
                columns={columns}
                data={tags}
                filterColumnId="value"
                filterPlaceholder="Filter tags..."
                initialPageSize={10}
                sortableColumnIds={["value", "created_at"]}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAdminPage(context, "/admin/tags", {
    requireTagsEnabled: true,
  });
};
