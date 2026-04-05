import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
};

const PopoverContext = React.createContext<PopoverContextValue>({
  open: false,
  onOpenChange: () => {},
  triggerRef: { current: null },
});

function Popover({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  children,
  ...props
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
  modal?: boolean;
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = React.useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      controlledOnOpenChange?.(next);
    },
    [controlledOnOpenChange],
  );

  return (
    <PopoverContext.Provider value={{ open, onOpenChange, triggerRef }}>
      <div data-slot="popover" className="relative inline-flex" {...props}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({
  asChild,
  children,
  onClick,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const { open, onOpenChange, triggerRef } = React.useContext(PopoverContext);
  return (
    <div
      ref={triggerRef}
      data-slot="popover-trigger"
      className="inline-flex"
      onClick={(e) => {
        onOpenChange(!open);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  side = "bottom",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const { open, onOpenChange, triggerRef } = React.useContext(PopoverContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
  }>({ top: -9999, left: -9999 });

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;

    let top = 0;
    let left = 0;

    if (side === "bottom") {
      top = triggerRect.bottom + sideOffset;
    } else if (side === "top") {
      top = triggerRect.top - sideOffset - contentRect.height;
    } else if (side === "left") {
      left = triggerRect.left - sideOffset - contentRect.width;
      top = triggerRect.top;
    } else {
      left = triggerRect.right + sideOffset;
      top = triggerRect.top;
    }

    if (side === "bottom" || side === "top") {
      if (align === "start") {
        left = triggerRect.left;
      } else if (align === "end") {
        left = triggerRect.right - contentRect.width;
      } else {
        left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      }
    }

    if (left + contentRect.width > vw - pad)
      left = vw - pad - contentRect.width;
    if (left < pad) left = pad;
    if (top + contentRect.height > vh - pad)
      top = vh - pad - contentRect.height;
    if (top < pad) top = pad;

    setPosition({ top, left });
  }, [open, side, align, sideOffset, triggerRef]);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("[data-slot='popover-trigger']")
      ) {
        onOpenChange(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      data-slot="popover-content"
      data-state="open"
      data-side={side}
      className={cn(
        "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 w-72 rounded-md border p-4 shadow-md outline-hidden",
        className,
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
};
