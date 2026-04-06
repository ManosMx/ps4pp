import { AllowedRole } from "@/lib/auth/server";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function useUserRole() {
  const [role, setRole] = useState<AllowedRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRole() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("app_role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!cancelled) {
        setRole((profile?.app_role as AllowedRole) ?? null);
        setLoading(false);
      }
    }

    fetchRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { role, loading };
}
