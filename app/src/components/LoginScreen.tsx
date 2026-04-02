import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import type { FeatureFlags } from "@/lib/types/types";
import getFeatureFlags from "@/pages/api/get-feature-flags";
import { toast } from "sonner";

const defaultFeatureFlags: FeatureFlags = {
  tagsEnabled: false,
  usersEnabled: false,
  approvalEnabled: false,
};

type AuthMode = "login" | "signup";

const authenticatedRedirectPath = "/post-login";

function getRedirectTarget(
  redirect: string | string[] | undefined,
  fallback = "/",
) {
  if (typeof redirect !== "string") {
    return fallback;
  }

  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallback;
  }

  return redirect === "/login" ? fallback : redirect;
}

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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

      if (error) {
        throw error;
      }

      if (!data) {
        return defaultFeatureFlags;
      }

      return {
        tagsEnabled: data.tagsEnabled,
        usersEnabled: data.usersEnabled,
        approvalEnabled: data.approvalEnabled,
      };
    },
  });
  const effectiveMode: AuthMode =
    mode === "signup" && !featureFlags.usersEnabled ? "login" : mode;

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && isMounted) {
        router.replace(authenticatedRedirectPath);
      }
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace(authenticatedRedirectPath);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required", {
        position: "bottom-right",
      });
      return;
    }

    if (effectiveMode === "signup" && !featureFlags.usersEnabled) {
      toast.error("Public signup is disabled", {
        description: "Signup becomes available only when users are enabled.",
        position: "bottom-right",
      });
      return;
    }

    setIsSubmitting(true);

    const result =
      effectiveMode === "login"
        ? await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        : await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

    setIsSubmitting(false);

    if (result.error) {
      toast.error(
        mode === "login" ? "Failed to sign in" : "Failed to sign up",
        {
          description: result.error.message,
          position: "bottom-right",
        },
      );
      return;
    }

    if (effectiveMode === "signup" && !result.data.session) {
      toast.success("Check your email", {
        description:
          "Your account was created. Confirm your email to finish signing in.",
        position: "bottom-right",
      });
      return;
    }

    toast.success(effectiveMode === "login" ? "Signed in" : "Account created", {
      position: "bottom-right",
    });

    if (!result.data.user) {
      await router.replace(redirectTarget);
      return;
    }

    await router.replace(authenticatedRedirectPath);
  };

  const onGoogleAuth = async () => {
    if (!featureFlags.usersEnabled) {
      toast.error("Google auth is unavailable right now", {
        description:
          "Public signup is disabled, so OAuth sign-in is also disabled for now.",
        position: "bottom-right",
      });
      return;
    }

    setIsGoogleSubmitting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login?redirect=${encodeURIComponent(redirectTarget)}`,
      },
    });

    setIsGoogleSubmitting(false);

    if (error) {
      toast.error("Failed to start Google auth", {
        description: error.message,
        position: "bottom-right",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,#dbeafe,#f8fafc_42%,#e2e8f0_100%)] px-4 py-10">
      <Card className="w-full max-w-md border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 p-1">
            <Button
              type="button"
              variant={effectiveMode === "login" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("login")}
            >
              Log in
            </Button>
            {featureFlags.usersEnabled ? (
              <Button
                type="button"
                variant={effectiveMode === "signup" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("signup")}
              >
                Sign up
              </Button>
            ) : null}
          </div>
          <CardTitle className="text-3xl tracking-tight text-slate-950">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            {mode === "login"
              ? "Log in to create posts, manage moderation, and access role-based areas."
              : "Sign up to start posting on the map when public users are enabled."}
          </CardDescription>
          {!featureFlags.usersEnabled ? (
            <CardDescription className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              Public signup is currently disabled. Existing users can still log
              in.
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
              />
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
            >
              {isSubmitting
                ? effectiveMode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : effectiveMode === "login"
                  ? "Log in"
                  : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-slate-100 pt-6">
          <div className="flex w-full items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onGoogleAuth}
            disabled={
              isSubmitting || isGoogleSubmitting || !featureFlags.usersEnabled
            }
          >
            {isGoogleSubmitting ? "Redirecting..." : "Continue with Google"}
          </Button>
          <p className="text-center text-xs leading-5 text-slate-500">
            Google auth is available only while public signup is enabled. This
            avoids accidental account creation through OAuth before backend
            signup controls are added.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
