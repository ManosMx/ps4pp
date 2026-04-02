import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { requireAdminPage } from "@/lib/auth/server";
import AdminTabs from "./AdminTabs";
import Users from "./users";

export default function ModeratorsPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <main className="container mx-auto p-16 justify-center align-middle">
      <div className="space-y-6">
        <AdminTabs
          activeTab="moderators"
          role={props.role}
          tagsEnabled={props.tagsEnabled}
        />
        <Users role={props.role} />
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAdminPage(context, "/admin/moderators");
};
