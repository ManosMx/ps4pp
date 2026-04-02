import type { GetServerSideProps } from "next";
import {
  getServerSessionWithRole,
  hasElevatedRole,
  redirectToLogin,
} from "@/lib/auth/server";

export default function PostLoginPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { user, role } = await getServerSessionWithRole(context);

  if (!user) {
    return redirectToLogin(context, "/post-login");
  }

  return {
    redirect: {
      destination: hasElevatedRole(role) ? "/admin" : "/my-posts",
      permanent: false,
    },
  };
};
