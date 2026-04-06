import { requireElevatedPage } from "@/lib/auth/server";
import type { GetServerSideProps } from "next";

export default function Admin() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const access = await requireElevatedPage(context, "/admin");

  if ("redirect" in access) {
    return access;
  }

  return {
    redirect: {
      destination: "/admin/posts",
      permanent: false,
    },
  };
};
