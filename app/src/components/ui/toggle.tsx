"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const toggleBase =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap";

const toggleVariantClasses: Record<string, string> = {
  default: "bg-transparent",
  outline:
    "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
};

const toggleSizeClasses: Record<string, string> = {
  default: "h-9 px-2 min-w-9",
  sm: "h-8 px-1.5 min-w-8",
  lg: "h-10 px-2.5 min-w-10",
};

function toggleVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: "default" | "outline" | null;
  size?: "default" | "sm" | "lg" | null;
  className?: string;
} = {}) {
  return cn(
    toggleBase,
    toggleVariantClasses[variant ?? "default"],
    toggleSizeClasses[size ?? "default"],
    className,
  );
}

type ToggleProps = React.ComponentProps<"button"> & {
  variant?: "default" | "outline" | null;
  size?: "default" | "sm" | "lg" | null;
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};

function Toggle({
  className,
  variant,
  size,
  pressed,
  onPressedChange,
  onClick,
  ...props
}: ToggleProps) {
  return (
    <button
      type="button"
      data-slot="toggle"
      aria-pressed={pressed}
      data-state={pressed ? "on" : "off"}
      className={cn(toggleVariants({ variant, size, className }))}
      onClick={(e) => {
        onPressedChange?.(!pressed);
        onClick?.(e);
      }}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
