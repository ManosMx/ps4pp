import { requireAdminPage } from "@/lib/auth/server";
import dynamic from "next/dist/shared/lib/dynamic";
import { GetServerSideProps } from "next/dist/types";
// @ts-expect-error -- TODO: fix this
import "leaflet/dist/leaflet.css";

const NewPostMap = dynamic(() => import("@/components/NewPostMap"), {
  ssr: false,
});

export default function NewPost() {
  return <NewPostMap />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAdminPage(context, "/admin/moderators");
};
