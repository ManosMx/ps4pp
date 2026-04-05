import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import getPageSlugs from "@/pages/api/get-page-slugs";

const activeClass =
  "text-sm font-medium text-primary underline underline-offset-[6px] decoration-2";
const inactiveClass =
  "text-sm font-medium text-gray-700 hover:text-primary transition-colors";

export default function Navbar({
  activeHash,
  showMyPosts,
}: {
  activeHash: string;
  showMyPosts: boolean;
}) {
  const { data: pages = [] } = useQuery({
    queryKey: ["page-slugs"],
    queryFn: async () => {
      const { data, error } = await getPageSlugs(supabase);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <nav className="sticky top-0 left-0 right-0 z-9999 flex w-full items-center justify-between bg-white px-8 py-4 shadow-sm">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-8">
        <a
          href="#map"
          className="text-lg font-bold tracking-tight text-primary"
        >
          PS4PP
        </a>

        <ul className="flex items-center gap-6">
          <li>
            <a
              href="#map"
              className={activeHash === "map" ? activeClass : inactiveClass}
            >
              Map
            </a>
          </li>
          {pages.map((page) => (
            <li key={page.id}>
              <a
                href={`#${page.slug ?? ""}`}
                className={
                  activeHash === page.slug ? activeClass : inactiveClass
                }
              >
                {page.title ?? page.slug}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Add Observation + User Icon */}
      <div className="flex items-center gap-4">
        {showMyPosts && (
          <Link
            href="/my-posts"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <MapPinIcon className="size-4" />
            Add post
          </Link>
        )}
      </div>
    </nav>
  );
}
