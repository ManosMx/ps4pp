import { useRouter } from "next/router";
import { LogOutIcon } from "lucide-react";
import { useLogout } from "../../lib/auth/useLogout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminTabsProps = {
  activeTab: "posts" | "tags" | "moderators" | "pages";
  role: "ADMIN" | "MODERATOR" | "USER" | null;
  tagsEnabled: boolean;
};

export default function AdminTabs({
  activeTab,
  role,
  tagsEnabled,
}: AdminTabsProps) {
  const router = useRouter();
  const canSeeAdminOnlyTabs = role === "ADMIN";
  const { isSigningOut, logout } = useLogout();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (value === "posts") {
          void router.push("/admin/posts");
        }

        if (value === "tags" && canSeeAdminOnlyTabs && tagsEnabled) {
          void router.push("/admin/tags");
        }

        if (value === "moderators" && canSeeAdminOnlyTabs) {
          void router.push("/admin/moderators");
        }

        if (value === "pages" && canSeeAdminOnlyTabs) {
          void router.push("/admin/pages");
        }
      }}
    >
      <TabsList variant="line">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        {canSeeAdminOnlyTabs && tagsEnabled ? (
          <TabsTrigger value="tags">Tags</TabsTrigger>
        ) : null}
        {canSeeAdminOnlyTabs ? (
          <TabsTrigger value="moderators">Moderators</TabsTrigger>
        ) : null}
        {canSeeAdminOnlyTabs ? (
          <TabsTrigger value="pages">Pages</TabsTrigger>
        ) : null}
        <TabsTrigger
          value="logout"
          disabled={isSigningOut}
          onClick={() => {
            void logout();
          }}
        >
          <LogOutIcon />
          {isSigningOut ? "Logging out..." : "Log out"}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
