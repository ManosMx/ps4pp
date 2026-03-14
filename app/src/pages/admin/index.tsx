import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";
import Posts from "./Posts";

export default function Admin({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="container mx-auto p-16 justify-center align-middle">
        <SidebarTrigger />
        <Posts />
      </main>
    </SidebarProvider>
  );
}
