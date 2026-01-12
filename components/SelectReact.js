"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { getLocale } from "@/app/get-locale";

export function SelectReactComponent({
  filter_type,
  options,
  setQuery,
  query,
  lang,
  handleKeyDown,
}) {
  const [open, setOpen] = React.useState(false);
  const t = getLocale(lang) || {};

  const selectedValues = React.useMemo(
    () => new Set(query.map((item) => item[0])),
    [query],
  );

  const handleSelect = (value, label) => {
    const newSet = new Set(selectedValues);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }

    const newQuery = Array.from(newSet).map((val) => {
      const option = options.find((opt) => opt.value === val);
      return [val, option?.label || label];
    });
    setQuery(newQuery);
  };

  const handleRemove = (value) => {
    const newQuery = query.filter((item) => item[0] !== value);
    setQuery(newQuery);
  };

  const handleClear = () => {
    setQuery([]);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
            onKeyDown={handleKeyDown}
          >
            <span className="truncate">
              {query.length > 0
                ? `${query.length} selected`
                : t.select || "Select"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="bg-white p-0 dark:bg-slate-900"
          align="start"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command className="bg-white dark:bg-slate-900">
            <CommandInput
              placeholder={`${t.search || "Search"}...`}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.has(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelect(option.value, option.label)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {query.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {query.map((item) => (
            <Badge
              key={item[0]}
              variant="secondary"
              className="bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 border-primary-600 dark:border-primary-500 gap-1 border px-2 py-1 text-sm font-medium text-white shadow-sm"
            >
              {item[1]}
              <button
                type="button"
                className="hover:bg-primary-700 dark:hover:bg-primary-800 ml-1 rounded-full p-0.5 transition-colors outline-none"
                onClick={() => handleRemove(item[0])}
                aria-label={`Remove ${item[1]}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            onClick={handleClear}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
