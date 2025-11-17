"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  FloatingLabel,
  Select,
  Datepicker,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { getLocale } from "@/app/get-locale";
import { SelectReactComponent } from "./SelectReact";
import { FiDelete } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { updateURLWithBadges } from "@/components/UrlParametrization";

// Helper to format an ISO date to YYYY-MM-DD (machine-friendly)
function toYMD(iso) {
  if (!iso) return "";
  // Expect an ISO string; just take the date part
  return iso.slice(0, 10);
}

export function SearchFilter({ lang, setBadges, badges }) {
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState("");

  const t = getLocale(lang);

  function onCloseModal() {
    setOpenModal(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Close modal and add badge
      setBadges((prevBadges) => ({
        ...prevBadges,
        search: query,
      }));
      setOpenModal(false);
    }
  };

  // Keep local query in sync with URL/app state when badges.search changes
  useEffect(() => {
    if (badges && typeof badges.search === "string") {
      setQuery(badges.search);
    } else if (!badges?.search && query !== "") {
      // If search was removed elsewhere, clear local query
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges?.search]);

  const clearSearchBadge = (e) => {
    if (e) e.stopPropagation();
    setBadges((prev) => {
      const next = { ...prev };
      delete next.search;
      return next;
    });
    setQuery("");
  };

  return (
    <>
      <Button
        className="bg-primary-500 gap-1 px-3 hover:cursor-pointer"
        pill
        size="xs"
        onClick={() => setOpenModal(true)}
      >
        {badges?.search ? (
          <>
            <span className="bg-accent-500 h-4 w-4 rounded-full border-0 text-center text-xs leading-4 text-black">
              1
            </span>
            <div>{t.search}</div>
            <span className="max-w-[120px] truncate text-xs opacity-90">
              : {badges.search}
            </span>
            <span
              role="button"
              tabIndex={0}
              className="hover:text-accent-500 group relative m-0 cursor-pointer border-0 bg-transparent p-0 pl-1 text-lg"
              onClick={clearSearchBadge}
              aria-label={t.remove_filter}
            >
              <FiDelete />
              <span className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
                {t.remove_filter}
              </span>
            </span>
          </>
        ) : (
          <div>{t.search}</div>
        )}
      </Button>
      <Modal
        dismissible
        show={openModal}
        size="xl"
        onClose={onCloseModal}
        popup
        className="rounded-lg border-0 text-lg"
      >
        <div className="relative">
          <FloatingLabel
            id="query-input"
            variant="filled"
            label={t.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rounded-lg border-0 pr-10 text-lg text-black focus:text-black dark:text-white focus:dark:text-white"
          />
          {query && (
            <button
              type="button"
              className="hover:text-accent-500 absolute top-1/2 right-2 -translate-y-1/2 rounded px-1 py-0.5 text-gray-500"
              aria-label={t.remove_filter}
              onClick={() => clearSearchBadge()}
            >
              <FiDelete />
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}

function TimeFilter({ lang, setBadges, setSelectedOption, badges }) {
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
        className="bg-primary-500 gap-1 hover:cursor-pointer"
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
                <span className="bg-primary-100 dark:bg-primary-900 mr-2 inline-block rounded px-2 py-0.5">
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
}

export function FilterItems({ filter_type, lang, setBadges, options, badges }) {
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
    }
  }, [filter_type, options, badges]);

  // Keep count in sync with query length
  const count = query.length;

  function onCloseModal() {
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
      setOpenModal(false);
    }
    if (e.key === "Enter") {
      if (query.length === 0) {
        setBadges((prevBadges) => ({ ...prevBadges, [filter_type]: [] }));
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
        className="bg-primary-500 gap-1 hover:cursor-pointer"
        onClick={() => setOpenModal(true)}
      >
        {count > 0 && (
          <>
            <span className="bg-accent-500 h-4 w-4 rounded-full border-0 text-xs text-black">
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
        <ModalBody>
          <SelectReactComponent
            filter_type={filter_type}
            options={options}
            setQuery={setQuery}
            query={query}
            lang={lang}
            handleKeyDown={handleKeyDown}
          />
        </ModalBody>
      </Modal>
    </>
  );
}

export function HexCellFilter({ lang, setBadges, badges }) {
  const t = getLocale(lang);

  // Only render if hex cell filter is active
  if (!badges?.hexCell) {
    return null;
  }

  const clearHexCellBadge = (e) => {
    if (e) e.stopPropagation();
    setBadges((prev) => {
      const next = { ...prev };
      delete next.hexCell;
      return next;
    });
  };

  return (
    <Button
      className="bg-primary-500 gap-1 px-3 hover:cursor-pointer"
      pill
      size="xs"
    >
      <span className="bg-accent-500 h-4 w-4 rounded-full border-0 text-center text-xs leading-4 text-black">
        1
      </span>
      <div>⬡ Area</div>
      <span className="max-w-[120px] truncate text-xs opacity-90">
        : {badges.hexCell.count} datasets
      </span>
      <span
        role="button"
        tabIndex={0}
        className="hover:text-accent-500 group relative m-0 cursor-pointer border-0 bg-transparent p-0 pl-1 text-lg"
        onClick={clearHexCellBadge}
        aria-label={t.remove_filter}
      >
        <FiDelete />
        <span className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
          {t.remove_filter}
        </span>
      </span>
    </Button>
  );
}

export default function FilterSection({
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
    <>
      <SidebarButton
        logo={<IoFilterOutline />}
        label={
          <div className="flex items-center gap-2">
            <div>{t.filters}</div>
            {(() => {
              const count = (() => {
                if (!badges) return 0;
                let c = 0;
                if (
                  typeof badges.search === "string" &&
                  badges.search.trim() !== ""
                )
                  c++;
                if (
                  Array.isArray(badges.organization) &&
                  badges.organization.length > 0
                )
                  c++;
                if (
                  Array.isArray(badges.projects) &&
                  badges.projects.length > 0
                )
                  c++;
                if (Array.isArray(badges.eov) && badges.eov.length > 0) c++;
                if (
                  typeof badges.filter_date === "string" &&
                  badges.filter_date.trim() !== ""
                )
                  c++;
                if (badges.hexCell && badges.hexCell.cellId) c++;
                return c;
              })();
              return count > 0 ? (
                <span className="bg-accent-500 h-4 min-w-4 rounded-full px-1 text-center text-xs leading-4 text-black">
                  {count}
                </span>
              ) : null;
            })()}
          </div>
        }
        onClick={toggleAccordion}
      />
      <div
        className={`overflow-visible transition-all duration-300 ${
          isAccordionOpen
            ? "border-primary-300 dark:border-primary-600 mt-1 max-h-[500px] translate-y-0 border-t p-2 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-row flex-wrap items-center justify-center gap-1">
            <SearchFilter lang={lang} setBadges={setBadges} badges={badges} />
            <HexCellFilter lang={lang} setBadges={setBadges} badges={badges} />
            <FilterItems
              filter_type="organization"
              lang={lang}
              setBadges={setBadges}
              options={orgList.map((org) => ({ label: org, value: org }))}
              badges={badges}
            />
            <FilterItems
              filter_type="projects"
              lang={lang}
              setBadges={setBadges}
              options={projList.map((proj) => ({ label: proj, value: proj }))}
              badges={badges}
            />
            <FilterItems
              filter_type="eov"
              lang={lang}
              setBadges={setBadges}
              options={eovList.map((eov) => ({ label: eov[1], value: eov[0] }))}
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
                className="text-accent-500 hover:text-accent-600 dark:text-accent-400 dark:hover:text-accent-500 flex items-center gap-1 text-xs font-medium underline transition-colors duration-200"
                onClick={clearAllFilters}
              >
                {t.clear_all_filters}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
