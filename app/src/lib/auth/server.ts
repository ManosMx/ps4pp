import { createServerClient } from "@supabase/ssr";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export type AllowedRole = "ADMIN" | "MODERATOR" | "USER";

type RolePageProps = {
  role: AllowedRole;
  tagsEnabled: boolean;
};

type RequireAdminPageOptions = {
  fallbackDestination?: string;
  requireTagsEnabled?: boolean;
  tagsDisabledRedirectDestination?: string;
};

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none" | boolean;
  secure?: boolean;
};

function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
) {
  const encodedValue = encodeURIComponent(value);
  const segments = [`${name}=${encodedValue}`];

  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  if (options.domain) {
    segments.push(`Domain=${options.domain}`);
  }

  if (options.path) {
    segments.push(`Path=${options.path}`);
  } else {
    segments.push("Path=/");
  }

  if (options.expires) {
    segments.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.httpOnly) {
    segments.push("HttpOnly");
  }

  if (options.secure) {
    segments.push("Secure");
  }

  if (options.sameSite) {
    const sameSite =
      options.sameSite === true ? "Strict" : String(options.sameSite);
    segments.push(
      `SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`,
    );
  }

  return segments.join("; ");
}

function appendSetCookieHeader(
  context: GetServerSidePropsContext,
  cookieValue: string,
) {
  const existingHeader = context.res.getHeader("Set-Cookie");

  if (!existingHeader) {
    context.res.setHeader("Set-Cookie", cookieValue);
    return;
  }

  if (Array.isArray(existingHeader)) {
    context.res.setHeader("Set-Cookie", [...existingHeader, cookieValue]);
    return;
  }

  context.res.setHeader("Set-Cookie", [String(existingHeader), cookieValue]);
}

export function createPagesServerClient(context: GetServerSidePropsContext) {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return Object.entries(context.req.cookies).map(([name, value]) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          appendSetCookieHeader(context, serializeCookie(name, value, options));
        });
      },
    },
  });
}

export async function getServerSessionWithRole(
  context: GetServerSidePropsContext,
) {
  const supabase = createPagesServerClient(context);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      role: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.app_role) {
    return {
      supabase,
      user,
      role: null,
    };
  }

  return {
    supabase,
    user,
    role: profile.app_role as AllowedRole,
  };
}

async function getServerTagsEnabled(context: GetServerSidePropsContext) {
  const supabase = createPagesServerClient(context);
  const { data, error } = await supabase
    .from("feature_flags")
    .select("tagsEnabled")
    .eq("id", true)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return data.tagsEnabled;
}

export function redirectToLogin(
  context: GetServerSidePropsContext,
  destination: string,
) {
  const redirect = encodeURIComponent(destination);

  return {
    redirect: {
      destination: `/login?redirect=${redirect}`,
      permanent: false,
    },
  } as const;
}

export function hasElevatedRole(
  role: string | null,
): role is "ADMIN" | "MODERATOR" {
  return role === "ADMIN" || role === "MODERATOR";
}

export async function requireElevatedPage(
  context: GetServerSidePropsContext,
  destination: string,
): Promise<GetServerSidePropsResult<RolePageProps>> {
  const { user, role } = await getServerSessionWithRole(context);

  if (!user) {
    return redirectToLogin(context, destination);
  }

  if (!hasElevatedRole(role)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const tagsEnabled = await getServerTagsEnabled(context);

  return {
    props: {
      role,
      tagsEnabled,
    },
  };
}

export async function requireAdminPage(
  context: GetServerSidePropsContext,
  destination: string,
  options: RequireAdminPageOptions = {},
): Promise<GetServerSidePropsResult<RolePageProps>> {
  const {
    fallbackDestination = "/admin/posts",
    requireTagsEnabled = false,
    tagsDisabledRedirectDestination = "/admin/posts",
  } = options;
  const { user, role } = await getServerSessionWithRole(context);

  if (!user) {
    return redirectToLogin(context, destination);
  }

  if (role !== "ADMIN") {
    return {
      redirect: {
        destination: fallbackDestination,
        permanent: false,
      },
    };
  }

  const tagsEnabled = await getServerTagsEnabled(context);

  if (requireTagsEnabled && !tagsEnabled) {
    return {
      redirect: {
        destination: tagsDisabledRedirectDestination,
        permanent: false,
      },
    };
  }

  return {
    props: {
      role,
      tagsEnabled,
    },
  };
}
