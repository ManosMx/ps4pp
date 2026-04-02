import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "../lib/auth/useLogout";

export default function LogoutButton({ className }: { className?: string }) {
  const { isSigningOut, logout } = useLogout();

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => {
        void logout();
      }}
      disabled={isSigningOut}
    >
      <LogOutIcon />
      {isSigningOut ? "Logging out..." : "Log out"}
    </Button>
  );
}
