import { cn } from "@/lib/utils";
import { Cross1Icon } from "@radix-ui/react-icons";
import PostView from "./PostView";

export default function PostViewSidebar({
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
        isOpen ? "w-md border-slate-200" : "w-0 border-transparent shadow-none",
      )}
    >
      {isOpen && (
        <button onClick={close}>
          <Cross1Icon className="absolute right-4 top-4 cursor-pointer" />
        </button>
      )}
      <PostView postId={postId} />
    </aside>
  );
}
