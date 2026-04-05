import * as React from "react";

import { cn } from "@/lib/utils";

function TooltipProvider({
  children,
}: {
  children: React.ReactNode;
  delayDuration?: number;
  [key: string]: unknown;
}) {
  return <>{children}</>;
}

function Tooltip({
  children,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}) {
  return (
    <div
      data-slot="tooltip"
      className="group/tooltip relative inline-flex"
      {...props}
    >
      {children}
    </div>
  );
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  return (
    <div data-slot="tooltip-trigger" className="inline-flex" {...props}>
      {children}
    </div>
  );
}

function TooltipContent({
  className,
  sideOffset = 0,
  side = "top",
  children,
  onPointerDownOutside: _onPointerDownOutside,
  ...props
}: React.ComponentProps<"div"> & {
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
  onPointerDownOutside?: (e: Event) => void;
}) {
  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      data-slot="tooltip-content"
      data-side={side}
      role="tooltip"
      className={cn(
        "bg-foreground text-background pointer-events-none invisible absolute z-50 w-max max-w-xs rounded-md px-3 py-1.5 text-xs text-balance opacity-0 transition-opacity group-hover/tooltip:visible group-hover/tooltip:opacity-100",
        positionClasses[side],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
