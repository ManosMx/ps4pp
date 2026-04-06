import Markdown from "react-markdown";
import { Skeleton } from "./ui/skeleton";
import { Post } from "@/pages/api/get-paginated-posts";
import { supabase } from "@/lib/supabase/client";
import getPostById from "@/pages/api/get-post-by-id";
import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";

export default function PostView({
  postId,
  onClose,
}: {
  postId: number;
  onClose?: () => void;
}) {
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await getPostById(supabase, postId);

      if (error) {
        throw error;
      }

      return data ? (data as unknown as Post) : null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <PostSkeleton />
      </div>
    );
  }

  const tags = post?.tags ?? [];

  return (
    <div className="flex h-full flex-col overflow-y-auto transition-[transform,opacity] duration-300 ease-out">
      {/* Hero image section */}
      <div className="relative min-h-32 w-full bg-secondary">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
          >
            <XIcon className="size-4" />
          </button>
        )}

        {/* Observation label + title */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="mt-1 font-heading text-2xl font-bold leading-tight text-white">
            {post?.title ?? "Post"}
          </h2>
          <p className="text-xs font-semibold tracking-[0.15em] text-white/80">
            {post?.location?.address ?? "Unknown location"}
          </p>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pt-5">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                borderColor: tag.color,
                color: tag.color,
              }}
            >
              {tag.value}
            </span>
          ))}
        </div>
      )}
      {/* Body */}
      <article
        className="prose prose-sm max-w-none px-6 pt-5 pb-8 text-foreground"
        dangerouslySetInnerHTML={post?.body ? { __html: post.body } : undefined}
      />
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="h-64 w-full rounded-none bg-muted" />
      <div className="space-y-3 p-6">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full bg-muted" />
          <Skeleton className="h-6 w-24 rounded-full bg-muted" />
          <Skeleton className="h-6 w-28 rounded-full bg-muted" />
        </div>
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-5/6 bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
      </div>
    </div>
  );
}
