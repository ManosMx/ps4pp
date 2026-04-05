"use client";

import * as React from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  id: number;
  value: string;
};

export default function ComboboxMultiple({
  value,
  items,
  onValueChange,
  placeholder = "Select tags...",
  emptyText = "No tags found.",
  className,
}: {
  value: Option[];
  items: Option[];
  onValueChange: (value: Option[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    if (!query) return items;
    const lower = query.toLowerCase();
    return items.filter((item) => item.value.toLowerCase().includes(lower));
  }, [items, query]);

  const selectedIds = React.useMemo(
    () => new Set(value.map((v) => v.id)),
    [value],
  );

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = (item: Option) => {
    if (selectedIds.has(item.id)) {
      onValueChange(value.filter((v) => v.id !== item.id));
    } else {
      onValueChange([...value, item]);
    }
  };

  const handleRemove = (id: number) => {
    onValueChange(value.filter((v) => v.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && value.length > 0) {
      onValueChange(value.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className="border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((v) => (
          <span
            key={v.id}
            className="bg-muted text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap"
          >
            {v.value}
            <button
              type="button"
              className="-ml-0.5 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(v.id);
              }}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="min-w-16 flex-1 bg-transparent outline-none"
          placeholder={value.length === 0 ? placeholder : ""}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && (
        <div className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 absolute z-999 mt-1 w-full rounded-md border shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="text-muted-foreground py-2 text-center text-sm">
                {emptyText}
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    className="hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none"
                    onClick={() => handleToggle(item)}
                  >
                    {item.value}
                    {isSelected && (
                      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                        <CheckIcon className="size-4" />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
