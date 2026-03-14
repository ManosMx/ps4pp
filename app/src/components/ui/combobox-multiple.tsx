"use client";

import { cn } from "@/lib/utils";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

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
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      multiple
      autoHighlight
      items={items}
      value={value}
      onValueChange={onValueChange}
    >
      <ComboboxChips ref={anchor} className={cn("w-full", className)}>
        <ComboboxValue>
          {(selectedValues) => (
            <>
              {selectedValues.map((selectedValue: Option) => (
                <ComboboxChip key={selectedValue.id}>
                  {selectedValue.value}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={selectedValues.length === 0 ? placeholder : ""}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: Option) => (
            <ComboboxItem key={item.id} value={item}>
              {item.value}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
