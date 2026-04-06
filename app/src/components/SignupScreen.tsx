import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
} from "lucide-react";
import AuthLayout, { useAuthGuard } from "@/components/AuthLayout";
import Link from "next/link";

export default function SignupScreen() {
  const router = useRouter();
  const { featureFlags, redirectTarget, authenticatedRedirectPath } =
    useAuthGuard();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required", {
        position: "bottom-right",
      });
      return;
    }

    if (!featureFlags.usersEnabled) {
      toast.error("Public signup is disabled", {
        description: "Signup becomes available only when users are enabled.",
        position: "bottom-right",
      });
      return;
    }

    setIsSubmitting(true);

    const result = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (result.error) {
      toast.error("Failed to sign up", {
        description: result.error.message,
        position: "bottom-right",
      });
      return;
    }

    if (!result.data.session) {
      toast.success("Check your email", {
        description:
          "Your account was created. Confirm your email to finish signing in.",
        position: "bottom-right",
      });
      return;
    }

    toast.success("Account created", { position: "bottom-right" });

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

  if (!featureFlags.usersEnabled) {
    return (
      <AuthLayout>
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Signup is disabled
        </h1>
        <p className="mt-2 text-center text-sm italic text-gray-500">
          Public signup is currently turned off. If you already have an account,
          you can still sign in.
        </p>
        <Link
          href="/login"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go to Sign In
          <ArrowRightIcon className="size-4" />
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Heading */}
      <h1 className="text-center text-2xl font-bold text-gray-900">
        Join the PS4PP
      </h1>
      <p className="mt-2 text-center text-sm italic text-gray-500">
        Start mapping your community stories and insights.
      </p>

      {/* Form */}
      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || isGoogleSubmitting}
              className="pl-10"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || isGoogleSubmitting}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isGoogleSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
          <ArrowRightIcon className="size-4" />
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
          or continue with
        </span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Social Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onGoogleAuth}
          disabled={isSubmitting || isGoogleSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isGoogleSubmitting ? "Redirecting..." : "Google"}
        </button>

        <button
          type="button"
          disabled={isSubmitting || isGoogleSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          onClick={() => toast.info("Facebook auth is not yet implemented.")}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>

      {/* Sign in link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="inline-block rounded-full border border-primary px-3 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Back to Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
