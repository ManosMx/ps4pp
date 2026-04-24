import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import getPageSlugs from "@/lib/queries/get-page-slugs";

const baseClass =
  "relative text-sm font-medium transition-colors pb-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200";
const activeClass = `${baseClass} text-primary after:w-full`;
const inactiveClass = `${baseClass} text-foreground hover:text-primary after:w-0 hover:after:w-full`;

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
    <nav className="sticky top-0 left-0 right-0 z-9999 flex w-full items-center justify-between bg-background px-8 py-4 shadow-sm">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-8">
        <a
          href="#map"
          className="font-heading text-lg font-bold tracking-tight text-primary"
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
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium !text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            <MapPinIcon className="size-4 text-white" />
            My posts
          </Link>
        )}
      </div>
    </nav>
  );
}
