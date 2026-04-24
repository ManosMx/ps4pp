import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import getPageBySlug from "@/lib/queries/get-page-by-slug";
import { Card } from "./ui/card";

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
    <div className="flex flex-1 justify-center py-16 bg-muted">
      <Card className="max-w-3xl rounded-lg border h-fit">
        <article
          className="prose prose-gray px-16 py-8"
          dangerouslySetInnerHTML={
            page.body ? { __html: page.body } : undefined
          }
        />
      </Card>
    </div>
  );
}
