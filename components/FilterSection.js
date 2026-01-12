"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import { getLocale } from "@/app/get-locale";
import { SelectReactComponent } from "./SelectReact";
import { FiDelete } from "react-icons/fi";
import { updateURLWithBadges } from "@/components/UrlParametrization";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to format an ISO date to YYYY-MM-DD (machine-friendly)
function toYMD(iso) {
  if (!iso) return "";
  // Expect an ISO string; just take the date part
  return iso.slice(0, 10);
}

export const SearchFilter = memo(function SearchFilter({
  lang,
  setBadges,
  badges,
}) {
  const [query, setQuery] = useState("");
  const debounceTimerRef = useRef(null);

  const t = getLocale(lang);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Add badge on Enter
      if (query.trim()) {
        setBadges((prevBadges) => ({
          ...prevBadges,
          search: query,
        }));
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timeout
    debounceTimerRef.current = setTimeout(() => {
      if (value.trim()) {
        setBadges((prevBadges) => ({
          ...prevBadges,
          search: value,
        }));
      } else {
        // Clear search badge if input is empty
        setBadges((prev) => {
          const next = { ...prev };
          delete next.search;
          return next;
        });
      }
    }, 500); // 500ms debounce delay
  };

  // Keep local query in sync with URL/app state when badges.search changes externally
  // Only sync if the local query doesn't match badges.search (to avoid conflicts during typing)
  useEffect(() => {
    if (
      badges &&
      typeof badges.search === "string" &&
      query !== badges.search
    ) {
      setQuery(badges.search);
    } else if (!badges?.search && query !== "") {
      // If search was removed elsewhere, clear local query
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges?.search]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const clearSearchBadge = (e) => {
    if (e) e.stopPropagation();
    setBadges((prev) => {
      const next = { ...prev };
      delete next.search;
      return next;
    });
    setQuery("");
  };

  const inputRef = useRef(null);

  const handleBoxClick = (e) => {
    // Don't focus if clicking the delete button
    if (e.target.closest("button")) return;
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" onClick={handleBoxClick}>
      <Label htmlFor="query-input" className="mb-1.5 text-sm">
        {t.search}
      </Label>
      <Input
        ref={inputRef}
        id="query-input"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="focus:border-primary-500 dark:bg-background-dark border-0 bg-white pr-8 focus:border"
      />
      {query && (
        <button
          type="button"
          className="hover:text-accent-500 absolute top-[34px] right-2 rounded-lg px-1 py-0.5 text-black dark:text-white"
          aria-label={t.remove_filter}
          onClick={clearSearchBadge}
        >
          <FiDelete />
        </button>
      )}
    </div>
  );
});

const TimeFilter = memo(function TimeFilter({
  lang,
  setBadges,
  setSelectedOption,
  badges,
}) {
  const [openModal, setOpenModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState("temporal-extent-overlaps");
  const t = getLocale(lang);

  // Sync local UI from badges (URL/app state)
  useEffect(() => {
    if (badges?.filter_date_field) {
      setSelectedType(badges.filter_date_field);
      setSelectedOption(badges.filter_date_field);
    }
    // If no value from URL/app, keep the default overlaps
    if (!badges?.filter_date_field) {
      setSelectedOption("temporal-extent-overlaps");
    }
    if (badges?.filter_date) {
      const [s, e] = String(badges.filter_date).split("%20TO%20");
      if (s) setStartDate(new Date(s));
      if (e) setEndDate(new Date(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges?.filter_date, badges?.filter_date_field]);

  // Apply time filter whenever dates or type change
  useEffect(() => {
    if (startDate && endDate && selectedType) {
      const strDates = `${toYMD(startDate.toISOString())}%20TO%20${toYMD(endDate.toISOString())}`;
      setBadges((prev) => ({
        ...prev,
        filter_date: strDates,
        filter_date_field: selectedType,
      }));
      setSelectedOption(selectedType);
    }
  }, [startDate, endDate, selectedType, setBadges, setSelectedOption]);

  function onCloseModal() {
    setOpenModal(false);
  }

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  // Clear the time badge and local UI state
  const clearTimeBadge = (e) => {
    if (e) e.stopPropagation();
    setBadges((prev) => {
      const next = { ...prev };
      delete next.filter_date;
      delete next.filter_date_field;
      return next;
    });
    setSelectedOption("");
  };

  return (
    <>
      <Button
        className="bg-primary-500 h-7 gap-1 rounded-full border border-white/20 px-3 text-xs text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        onClick={() => setOpenModal(true)}
      >
        {badges?.filter_date ? (
          <>
            <span className="bg-accent-500 h-4 w-4 rounded-full border-0 text-center text-xs leading-4 text-black">
              1
            </span>
            <div>{t.time}</div>
            <span
              role="button"
              tabIndex={0}
              className="hover:text-accent-500 group relative m-0 cursor-pointer border-0 bg-transparent p-0 pl-1 text-lg"
              onClick={clearTimeBadge}
              aria-label={t.remove_filter}
            >
              <FiDelete />
              <span className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
                {t.remove_filter}
              </span>
            </span>
          </>
        ) : (
          <div>{t.time}</div>
        )}
      </Button>
      <Dialog open={openModal} onOpenChange={(open) => !open && onCloseModal()}>
        <DialogContent className="bg-background-light dark:bg-background-dark max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {t.filter_by} {t.time}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="date-filter-type"
                  className="text-sm opacity-80"
                >
                  {t.timefield}
                </Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setSelectedOption(value);
                  }}
                >
                  <SelectTrigger id="date-filter-type" className="h-10 w-full">
                    <SelectValue placeholder={t.select} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporal-extent-begin">
                      {t["temporal-extent-begin"]}
                    </SelectItem>
                    <SelectItem value="temporal-extent-end">
                      {t["temporal-extent-end"]}
                    </SelectItem>
                    <SelectItem value="temporal-extent-overlaps">
                      {t["temporal-extent-overlaps"]}
                    </SelectItem>
                    <SelectItem value="metadata_created">
                      {t["metadata_created"]}
                    </SelectItem>
                    <SelectItem value="metadata_modified">
                      {t["metadata_modified"]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm opacity-80">{t.from}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>{t.start_date}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="bg-background-light dark:bg-background-dark p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      disabled={(date) =>
                        date > (endDate || new Date()) || date > new Date()
                      }
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm opacity-80">{t.to}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>{t.end_date}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="bg-background-light dark:bg-background-dark p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) => date < startDate || date > new Date()}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm opacity-80">&nbsp;</Label>
                <Button
                  variant="outline"
                  className="h-10 shrink-0 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  onClick={clearTimeBadge}
                  disabled={!badges?.filter_date}
                >
                  {t.clear}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export const FilterItems = memo(function FilterItems({
  filter_type,
  lang,
  setBadges,
  options,
  badges,
}) {
  const [openModal, setOpenModal] = useState(false);

  const t = getLocale(lang);
  const [query, setQuery] = useState([]);

  useEffect(() => {
    // Initialize query from badges if available to load existing filters in URL
    const selectedValues = badges[filter_type]
      ? badges[filter_type].map((arr) => arr[0])
      : [];

    const badgeLabels = selectedValues
      .map((badgeValue) => {
        // Find the corresponding label in options
        const found = options.find((opt) => opt.value === badgeValue);
        return found ? [found.value, found.label] : null;
      })
      .filter((label) => label !== null);

    if (badgeLabels.length > 0) {
      setQuery(badgeLabels);
    } else {
      // Clear query when badges are cleared
      setQuery([]);
    }
  }, [filter_type, options, badges]);

  // Keep count in sync with query length
  const count = query.length;

  function onCloseModal(event) {
    // If event is provided, check if it's a backdrop click
    if (event?.target) {
      // Check if click is on a react-select dropdown element
      const isSelectDropdown =
        event.target.closest('[class*="react-select"]') ||
        event.target.closest('[id*="-listbox"]') ||
        event.target.closest('[id*="-option"]');

      // Prevent closing if clicking on dropdown
      if (isSelectDropdown) {
        return;
      }
    }

    if (query.length === 0) {
      setOpenModal(false);
      setBadges((prevBadges) => ({ ...prevBadges, [filter_type]: [] }));
      return;
    }
    setBadges((prevBadges) => ({ ...prevBadges, [filter_type]: query }));
    setOpenModal(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCloseModal();
    }
    if (e.key === "Enter") {
      if (query.length === 0) {
        setBadges((prevBadges) => ({ ...prevBadges, [filter_type]: [] }));
        setOpenModal(false);
        return;
      }
      setBadges((prevBadges) => ({ ...prevBadges, [filter_type]: query }));
      setOpenModal(false);
    }
  };

  // Remove badge and clear query/count
  const removeBadge = (filterType) => {
    setBadges((prevBadges) => {
      const updatedBadges = { ...prevBadges };
      delete updatedBadges[filterType];
      return updatedBadges;
    });
    setQuery([]);
    if (filterType === "filter_date") {
      setSelectedOption && setSelectedOption("");
    }
  };

  return (
    <>
      <Button
        className="bg-primary-500 h-7 gap-1 rounded-full border border-white/20 px-3 text-xs text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        onClick={() => setOpenModal(true)}
      >
        {count > 0 && (
          <>
            <span className="bg-accent-500 min-w-4 items-center justify-center rounded-full px-1 text-xs text-black">
              {count}
            </span>
            <div>{t[filter_type]}</div>
            <span
              role="button"
              tabIndex={0}
              className="hover:text-accent-500 group relative m-0 cursor-pointer border-0 bg-transparent p-0 pl-1 text-lg"
              onClick={(e) => {
                e.stopPropagation();
                removeBadge(filter_type);
              }}
              aria-label={t.remove_filter}
            >
              <FiDelete />
              <span className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
                {t.remove_filter}
              </span>
            </span>
          </>
        )}
        {count === 0 && <div>{t[filter_type]}</div>}
      </Button>
      <Dialog open={openModal} onOpenChange={(open) => !open && onCloseModal()}>
        <DialogContent className="bg-background-light dark:bg-background-dark max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t.filter_by} {t[filter_type].toLowerCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <SelectReactComponent
              filter_type={filter_type}
              options={options}
              setQuery={setQuery}
              query={query}
              lang={lang}
              handleKeyDown={handleKeyDown}
              onClear={() => {
                setBadges((prev) => {
                  const next = { ...prev };
                  delete next[filter_type];
                  return next;
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

const FilterSection = memo(function FilterSection({
  lang,
  badges,
  setBadges,
  orgList,
  projList,
  eovList,
  setSelectedOption,
  isOpen,
  setIsOpen,
}) {
  const t = getLocale(lang);
  const [isAccordionOpen, setIsAccordionOpen] = useState(isOpen || false);

  // Memoize options to prevent re-creating them on every render
  const orgOptions = useMemo(
    () => orgList.map((org) => ({ label: org, value: org })),
    [orgList],
  );

  const projOptions = useMemo(
    () => projList.map((proj) => ({ label: proj, value: proj })),
    [projList],
  );

  const eovOptions = useMemo(
    () => eovList.map((eov) => ({ label: eov[1], value: eov[0] })),
    [eovList],
  );

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (badges?.search) count++;
    if (badges?.filter_date) count++;
    if (badges?.organization && badges.organization.length > 0)
      count += badges.organization.length;
    if (badges?.projects && badges.projects.length > 0)
      count += badges.projects.length;
    if (badges?.eov && badges.eov.length > 0) count += badges.eov.length;
    return count;
  };

  const clearAllFilters = () => {
    setBadges({});
    setSelectedOption("");
  };

  useEffect(() => {
    // Update URL with badges whenever badges change
    updateURLWithBadges(badges);
  }, [badges]);

  useEffect(() => {
    // Sync internal state with external state
    if (isOpen !== undefined) {
      setIsAccordionOpen(isOpen);
    }
  }, [isOpen]);

  const activeFilterCount = countActiveFilters();

  return (
    <div
      className={`overflow-visible ${
        isAccordionOpen
          ? "border-background-light dark:border-background-dark mx-1 mt-1 max-h-[500px] translate-y-0 border-t p-2 opacity-100 transition-all duration-200"
          : "pointer-events-none max-h-0 -translate-y-4 opacity-0"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row flex-wrap items-center justify-center gap-1.5">
          <FilterItems
            filter_type="organization"
            lang={lang}
            setBadges={setBadges}
            options={orgOptions}
            badges={badges}
          />
          <FilterItems
            filter_type="projects"
            lang={lang}
            setBadges={setBadges}
            options={projOptions}
            badges={badges}
          />
          <FilterItems
            filter_type="eov"
            lang={lang}
            setBadges={setBadges}
            options={eovOptions}
            badges={badges}
          />
          <TimeFilter
            lang={lang}
            setBadges={setBadges}
            setSelectedOption={setSelectedOption}
            badges={badges}
          />
        </div>
        {activeFilterCount > 0 && (
          <div className="flex justify-center">
            <button
              className="text-ui-text-light dark:text-ui-text-dark dark:hover:text-ui-text-light flex items-center gap-1 text-xs font-medium underline transition-colors duration-200 hover:cursor-pointer"
              onClick={clearAllFilters}
            >
              {t.clear_all_filters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default FilterSection;
