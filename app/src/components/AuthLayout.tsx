import { useEffect, useMemo, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { FeatureFlags } from "@/lib/types/types";
import getFeatureFlags from "@/pages/api/get-feature-flags";

export const defaultFeatureFlags: FeatureFlags = {
  tagsEnabled: false,
  usersEnabled: false,
  approvalEnabled: false,
};

const authenticatedRedirectPath = "/post-login";

export function getRedirectTarget(
  redirect: string | string[] | undefined,
  fallback = "/",
) {
  if (typeof redirect !== "string") return fallback;
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return fallback;
  return redirect === "/login" ? fallback : redirect;
}

/** Shared auth state: session guard, feature flags, redirect target. */
export function useAuthGuard() {
  const router = useRouter();

  const redirectTarget = useMemo(
    () => getRedirectTarget(router.query.redirect),
    [router.query.redirect],
  );

  const { data: featureFlags = defaultFeatureFlags } = useQuery<
    FeatureFlags,
    Error
  >({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await getFeatureFlags(supabase);
      if (error) throw error;
      if (!data) return defaultFeatureFlags;
      return {
        tagsEnabled: data.tagsEnabled,
        usersEnabled: data.usersEnabled,
        approvalEnabled: data.approvalEnabled,
      };
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && isMounted) router.replace(authenticatedRedirectPath);
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(authenticatedRedirectPath);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return { featureFlags, redirectTarget, authenticatedRedirectPath };
}

/** Shell wrapper shared by login and signup screens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      {/* Header Logo */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
          ⊔
        </div>
        <span className="text-xl font-bold text-primary">PS4PP</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-start justify-center px-4 pt-8">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-10 py-10">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-8 py-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="font-bold text-gray-700">PS4PP</span>
          <span>
            &copy; {new Date().getFullYear()} PS4PP. Building community through
            maps.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-gray-700">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-700">
            Terms of Service
          </a>
          <a href="#" className="hover:text-gray-700">
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
}
