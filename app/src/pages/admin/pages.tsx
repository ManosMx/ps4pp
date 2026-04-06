import { requireAdminPage } from "@/lib/auth/server";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import AdminTabs from "./AdminTabs";
import PagesAdmin from "./PagesAdmin";

export default function PagesPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <div className="flex flex-col items-center h-full py-16 gap-8 bg-muted">
      <AdminTabs
        activeTab="pages"
        role={props.role}
        tagsEnabled={props.tagsEnabled}
      />
      <PagesAdmin />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAdminPage(context, "/admin/pages");
};
