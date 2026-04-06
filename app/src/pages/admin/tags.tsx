import { requireAdminPage } from "@/lib/auth/server";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import AdminTabs from "./AdminTabs";
import TagsAdmin from "./TagsAdmin";

export default function TagsPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <div className="flex flex-col items-center h-full py-16 gap-8 bg-muted">
      <AdminTabs
        activeTab="tags"
        role={props.role}
        tagsEnabled={props.tagsEnabled}
      />
      <TagsAdmin />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAdminPage(context, "/admin/tags", {
    requireTagsEnabled: true,
  });
};
