import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { requireElevatedPage } from "@/lib/auth/server";
import AdminTabs from "./AdminTabs";
import PostsAdmin from "./PostsAdmin";

export default function PostsPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <div className="flex flex-col items-center h-full py-16 gap-8 bg-muted">
      <AdminTabs
        activeTab="posts"
        role={props.role}
        tagsEnabled={props.tagsEnabled}
      />
      <PostsAdmin />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireElevatedPage(context, "/admin/posts");
};
