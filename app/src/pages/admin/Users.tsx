import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type AppRole = "ADMIN" | "MODERATOR" | "USER";

type ManageableUserRow = {
  id: string;
  email: string | null;
  display_name: string;
  app_role: AppRole;
  created_at: string | null;
};

function getUserLabel(user: ManageableUserRow) {
  return user.email ?? user.display_name;
}

function getRolePillClassName(role: AppRole) {
  if (role === "ADMIN") {
    return "border-primary bg-primary text-primary-foreground";
  }

  if (role === "MODERATOR") {
    return "border-secondary bg-secondary text-secondary-foreground";
  }

  return "border-border bg-muted text-muted-foreground";
}

export default function Users({ role }: { role: AppRole | null }) {
  const queryClient = useQueryClient();
  const [usernameFilter, setUsernameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");

  const canManageModerators = role === "ADMIN";

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery<ManageableUserRow[], Error>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_manageable_users");

      if (error) {
        throw error;
      }

      return (data ?? []) as ManageableUserRow[];
    },
  });

  const {
    mutateAsync: updateRole,
    isPending,
    variables,
  } = useMutation({
    mutationFn: async ({ id, nextRole }: { id: string; nextRole: AppRole }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ app_role: nextRole })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const filteredUsers = useMemo(() => {
    const normalizedUsername = usernameFilter.trim().toLowerCase();
    const normalizedEmail = emailFilter.trim().toLowerCase();
    const normalizedId = idFilter.trim().toLowerCase();

    return users.filter((user) => {
      const matchesUsername = normalizedUsername
        ? user.display_name.toLowerCase().includes(normalizedUsername)
        : true;
      const matchesEmail = normalizedEmail
        ? (user.email ?? "").toLowerCase().includes(normalizedEmail)
        : true;
      const matchesId = normalizedId
        ? user.id.toLowerCase().includes(normalizedId)
        : true;
      const matchesRole =
        roleFilter === "all" ? true : user.app_role === roleFilter;

      return matchesUsername && matchesEmail && matchesId && matchesRole;
    });
  }, [emailFilter, idFilter, roleFilter, usernameFilter, users]);

  const columns = useMemo<ColumnDef<ManageableUserRow>[]>(() => {
    return [
      {
        accessorKey: "display_name",
        header: "Username",
        cell: ({ row }) => {
          return (
            <span className="block max-w-[16rem] truncate font-medium text-foreground">
              {row.original.display_name}
            </span>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          return (
            <span className="block max-w-[20rem] truncate text-sm text-muted-foreground">
              {row.original.email ?? "No email"}
            </span>
          );
        },
      },
      {
        accessorKey: "id",
        header: "User ID",
        cell: ({ row }) => {
          return (
            <span className="block max-w-[18rem] truncate font-mono text-xs text-muted-foreground">
              {row.original.id}
            </span>
          );
        },
      },
      {
        accessorKey: "app_role",
        header: "Role",
        cell: ({ row }) => {
          const currentRole = row.original.app_role;

          return (
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getRolePillClassName(currentRole)}`}
            >
              {currentRole}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
          if (!row.original.created_at) {
            return "N/A";
          }

          return new Date(row.original.created_at).toLocaleString();
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;

          if (user.app_role === "ADMIN") {
            return (
              <span className="text-sm text-muted-foreground">Protected</span>
            );
          }

          if (!canManageModerators) {
            return (
              <span className="text-sm text-muted-foreground">Admins only</span>
            );
          }

          const nextRole = user.app_role === "MODERATOR" ? "USER" : "MODERATOR";
          const isUpdatingCurrentRow = isPending && variables?.id === user.id;

          return (
            <Button
              type="button"
              size="sm"
              variant={user.app_role === "MODERATOR" ? "outline" : "default"}
              disabled={isUpdatingCurrentRow}
              onClick={async () => {
                try {
                  await updateRole({ id: user.id, nextRole });

                  toast.success(
                    nextRole === "MODERATOR"
                      ? "Moderator added"
                      : "Moderator removed",
                    {
                      description: `${getUserLabel(user)} is now ${nextRole}.`,
                      position: "bottom-right",
                    },
                  );
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : "Unknown error";

                  toast.error("Failed to update role", {
                    description: message,
                    position: "bottom-right",
                  });
                }
              }}
            >
              {isUpdatingCurrentRow
                ? "Saving..."
                : user.app_role === "MODERATOR"
                  ? "Remove moderator"
                  : "Make moderator"}
            </Button>
          );
        },
      },
    ];
  }, [canManageModerators, isPending, updateRole, variables?.id]);

  if (!canManageModerators) {
    return null;
  }

  if (isLoading) {
    return <div>Loading moderators...</div>;
  }

  if (isError) {
    return <div>Failed to load moderator data: {error.message}</div>;
  }

  return (
    <Card className="w-3/4">
      <CardHeader className="flex flex-col gap-4">
        <CardTitle>Manage moderators</CardTitle>
        <p className="text-sm text-muted-foreground">
          Promote users to moderators or remove moderator access. Names and
          emails come from the auth directory, while roles still come from
          profiles. Admin accounts stay read-only here.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            value={usernameFilter}
            onChange={(event) => setUsernameFilter(event.target.value)}
            placeholder="Filter by username..."
          />

          <Input
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            placeholder="Filter by email..."
          />

          <Input
            value={idFilter}
            onChange={(event) => setIdFilter(event.target.value)}
            placeholder="Filter by user ID..."
          />

          <select
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as "all" | AppRole)
            }
          >
            <option value="all">All roles</option>
            <option value="USER">Users</option>
            <option value="MODERATOR">Moderators</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          filterColumnId={null}
          initialPageSize={10}
          sortableColumnIds={[]}
        />
      </CardContent>
    </Card>
  );
}
