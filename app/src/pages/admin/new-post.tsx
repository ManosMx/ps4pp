import NewPostMap from "@/components/NewPostMap";
import { requireAdminPage } from "@/lib/auth/server";
import { GetServerSideProps } from "next/dist/types";

export default function NewPost() {
  return <NewPostMap />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAdminPage(context, "/admin/moderators");
};
