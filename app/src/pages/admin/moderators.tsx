import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { requireAdminPage } from "@/lib/auth/server";
import AdminTabs from "./AdminTabs";
import Users from "./Users";

export default function ModeratorsPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <div className="flex flex-col items-center h-full py-16 gap-8 bg-muted">
      <AdminTabs
        activeTab="moderators"
        role={props.role}
        tagsEnabled={props.tagsEnabled}
      />
      <Users role={props.role} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAdminPage(context, "/admin/moderators");
};
