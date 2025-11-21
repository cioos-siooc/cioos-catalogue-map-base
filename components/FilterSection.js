"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  FloatingLabel,
  Select,
  Datepicker,
} from "flowbite-react";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import { getLocale } from "@/app/get-locale";
import { SelectReactComponent } from "./SelectReact";
import { FiDelete } from "react-icons/fi";
import { updateURLWithBadges } from "@/components/UrlParametrization";

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
  const [openModal, setOpenModal] = useState(false);
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
    <div className="relative w-full cursor-text" onClick={handleBoxClick}>
      <FloatingLabel
        ref={inputRef}
        id="query-input"
        variant="filled"
        label={t.search}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full rounded-lg border-0"
      />
      {query && (
        <button
          type="button"
          className="hover:text-accent-500 absolute top-1/2 right-2 -translate-y-1/2 rounded px-1 py-0.5 text-gray-500"
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

  // Apply time filter
  const applyTimeFilter = () => {
    if (!startDate || !endDate) return;
    // Persist the selected type to the parent for filtering
    if (selectedType) setSelectedOption(selectedType);
    const strDates = `${toYMD(startDate.toISOString())}%20TO%20${toYMD(endDate.toISOString())}`;
    setBadges((prev) => ({
      ...prev,
      filter_date: strDates,
      ...(selectedType ? { filter_date_field: selectedType } : {}),
    }));
    setOpenModal(false);
  };

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
        className="bg-primary-500 gap-1 border border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-lg"
        pill
        size="xs"
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
      <Modal
        dismissible
        show={openModal}
        size="3xl"
        onClose={onCloseModal}
        popup
      >
        <ModalHeader>
          {t.filter_by} {t.time}
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4 overflow-visible p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col">
              <label
                htmlFor="date-filter-type"
                className="mb-1 text-sm opacity-80"
              >
                {t.timefield}
              </label>
              <Select
                className="w-full min-w-[180px] p-2"
                id="date-filter-type"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedOption(e.target.value);
                }}
              >
                <option value="">{t.select}</option>
                <option value="temporal-extent-begin">
                  {t["temporal-extent-begin"]}
                </option>
                <option value="temporal-extent-end">
                  {t["temporal-extent-end"]}
                </option>
                <option value="temporal-extent-overlaps">
                  {t["temporal-extent-overlaps"]}
                </option>
                <option value="metadata_created">
                  {t["metadata_created"]}
                </option>
                <option value="metadata_modified">
                  {t["metadata_modified"]}
                </option>
              </Select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm opacity-80">{t.from}</label>
              <Datepicker
                className="w-full min-w-[180px] p-2"
                language={`${lang}-CA`}
                onChange={handleStartDateChange}
                value={startDate}
                selected={startDate}
                maxDate={endDate || new Date()}
                labelTodayButton={t.today}
                labelClearButton={t.clear}
                placeholder={t.start_date}
                onKeyDown={(e) => e.key === "Enter" && applyTimeFilter()}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm opacity-80">{t.to}</label>
              <Datepicker
                className="w-full min-w-[180px] p-2"
                language={`${lang}-CA`}
                onChange={handleEndDateChange}
                value={endDate}
                selected={endDate}
                minDate={startDate}
                maxDate={new Date()}
                labelTodayButton={t.today}
                labelClearButton={t.clear}
                placeholder={t.end_date}
                onKeyDown={(e) => e.key === "Enter" && applyTimeFilter()}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs opacity-80">
              {selectedType && (
                <span className="bg-background-light dark:bg-background-dark mr-2 inline-block rounded px-2 py-0.5">
                  {t[selectedType] || selectedType}
                </span>
              )}
              {startDate && endDate && (
                <span>
                  {toYMD(startDate.toISOString())} {t.between_date}{" "}
                  {toYMD(endDate.toISOString())}
                </span>
              )}
            </div>
            <div className="mt-2 flex gap-2 sm:mt-0">
              <Button color="gray" size="sm" onClick={clearTimeBadge}>
                {t.clear}
              </Button>
              <Button
                color="blue"
                size="sm"
                onClick={applyTimeFilter}
                disabled={!startDate || !endDate || !selectedType}
              >
                {t.apply}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
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
      ? badges[filter_type].map((arr) => arr[1])
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
        pill
        size="xs"
        className="bg-primary-500 gap-1 border border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-lg"
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
      <Modal
        dismissible
        show={openModal}
        size="lg"
        onClose={onCloseModal}
        popup
      >
        <ModalHeader>
          {t.filter_by} {t[filter_type].toLowerCase()}
        </ModalHeader>
        <ModalBody className="pb-2">
          <SelectReactComponent
            filter_type={filter_type}
            options={options}
            setQuery={setQuery}
            query={query}
            lang={lang}
            handleKeyDown={handleKeyDown}
          />
        </ModalBody>
        <ModalFooter className="flex justify-end gap-2 pt-2">
          <Button
            color="gray"
            size="sm"
            onClick={() => {
              setQuery([]);
              setBadges((prev) => {
                const next = { ...prev };
                delete next[filter_type];
                return next;
              });
            }}
          >
            {t.clear}
          </Button>
          <Button color="blue" size="sm" onClick={onCloseModal}>
            {t.apply}
          </Button>
        </ModalFooter>
      </Modal>
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
          ? "border-primary-300 dark:border-primary-600 mt-1 max-h-[500px] translate-y-0 border-t p-2 opacity-100 transition-all duration-200"
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
              className="text-primary-800 hover:text-primary-300 dark:text-primary-100 dark:hover:text-primary-900 flex items-center gap-1 text-xs font-medium underline transition-colors duration-200 hover:cursor-pointer"
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
