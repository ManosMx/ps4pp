import { cn } from "@/lib/utils";
import PostView from "./PostView";

export default function Sidebar({
  postId,
  isOpen,
  close,
}: {
  postId: number;
  isOpen: boolean;
  close: () => void;
}) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "relative h-full shrink-0 overflow-hidden border-l bg-white shadow-2xl transition-[width,border-color,box-shadow] duration-300 ease-out",
        isOpen ? "w-1/3 border-border" : "w-0 border-transparent shadow-none",
      )}
    >
      <PostView postId={postId} onClose={close} />
    </aside>
  );
}
