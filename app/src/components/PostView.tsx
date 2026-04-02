import { Suspense } from "react";
import Markdown from "react-markdown";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { Post } from "@/pages/api/get-paginated-posts";
import { supabase } from "@/lib/supabase/client";
import getPostById from "@/pages/api/get-post-by-id";
import { useQuery } from "@tanstack/react-query";

export default function PostView({ postId }: { postId: number }) {
  const { data: post } = useQuery<Post | null, Error>({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await getPostById(supabase, postId);

      if (error) {
        throw error;
      }

      return data ? (data as unknown as Post) : null;
    },
  });

  return (
    <div className="flex h-full w-2xl flex-col overflow-y-auto p-6 transition-[transform,opacity] duration-300 ease-out">
      <Suspense fallback={<PostSkeleton />}>
        <h2 className="text-2xl font-semibold tracking-tight">
          {post?.title ?? "Post"}
        </h2>
        <Markdown>{post?.body ?? ""}</Markdown>
      </Suspense>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="w-full p-4">
      <Skeleton className="mb-2 h-6 w-3/4" />
      <Skeleton className="mb-1 h-4 w-full" />
      <Skeleton className="mb-1 h-4 w-full" />
      <Skeleton className="mb-1 h-4 w-full" />
      <Skeleton className="mb-1 h-4 w-full" />
    </div>
  );
}
