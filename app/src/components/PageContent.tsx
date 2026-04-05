import { useQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";
import { supabase } from "@/lib/supabase/client";
import getPageBySlug from "@/pages/api/get-page-by-slug";

export default function PageContent({ slug }: { slug: string }) {
  const { data: page, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await getPageBySlug(supabase, slug);
      if (error) throw error;
      return data;
    },
    enabled: slug.length > 0,
  });

  if (!slug) return null;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-gray-500">Page not found.</span>
      </div>
    );
  }

  return (
    <article className="prose prose-gray mx-auto w-full align-center flex flex-col overflow-y-auto p-16">
      <Markdown
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="underline text-blue-500 hover:text-blue-700 transition-colors duration-200"
            />
          ),
        }}
      >
        {page.body ?? ""}
      </Markdown>
    </article>
  );
}
