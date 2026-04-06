"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<{
  size?: "default" | "sm" | "lg" | null;
  variant?: "default" | "outline" | null;
  spacing?: number;
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string) => void;
}>({
  size: "default",
  variant: "default",
  spacing: 0,
});

type ToggleGroupProps = React.ComponentProps<"div"> & {
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  variant?: "default" | "outline" | null;
  size?: "default" | "sm" | "lg" | null;
  spacing?: number;
  disabled?: boolean;
};

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  type = "single",
  value,
  onValueChange,
  children,
  ...props
}: ToggleGroupProps) {
  const handleItemToggle = React.useCallback(
    (itemValue: string) => {
      if (type === "single") {
        onValueChange?.(itemValue === value ? "" : itemValue);
      } else if (type === "multiple") {
        const arr = (value as string[]) ?? [];
        const next = arr.includes(itemValue)
          ? arr.filter((v) => v !== itemValue)
          : [...arr, itemValue];
        onValueChange?.(next);
      }
    },
    [type, value, onValueChange],
  );

  return (
    <div
      role="group"
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          spacing,
          type,
          value,
          onValueChange: handleItemToggle,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </div>
  );
}

type ToggleGroupItemProps = React.ComponentProps<"button"> & {
  value: string;
  variant?: "default" | "outline" | null;
  size?: "default" | "sm" | "lg" | null;
};

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value: itemValue,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const isPressed =
    context.type === "multiple"
      ? ((context.value as string[]) ?? []).includes(itemValue)
      : context.value === itemValue;

  return (
    <button
      type="button"
      role="radio"
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      data-state={isPressed ? "on" : "off"}
      aria-checked={isPressed}
      aria-pressed={isPressed}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className,
      )}
      onClick={() => context.onValueChange?.(itemValue)}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
