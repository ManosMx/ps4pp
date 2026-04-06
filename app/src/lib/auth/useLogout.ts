import { useState } from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const logout = async () => {
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsSigningOut(false);
      toast.error("Failed to log out", {
        description: error.message,
        position: "bottom-right",
      });
      return;
    }

    await queryClient.cancelQueries();
    queryClient.clear();

    toast.success("Logged out", {
      position: "bottom-right",
    });

    await router.replace("/login");
  };

  return {
    isSigningOut,
    logout,
  };
}
