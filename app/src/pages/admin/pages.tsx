import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminPage } from "@/lib/auth/server";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import AdminTabs from "./AdminTabs";

export default function PagesPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <main className="container mx-auto p-16 justify-center align-middle">
      <div className="space-y-6">
        <AdminTabs
          activeTab="pages"
          role={props.role}
          tagsEnabled={props.tagsEnabled}
        />
        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
          </CardHeader>
          <CardContent>
            Static page management has not been implemented yet.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAdminPage(context, "/admin/pages");
};
