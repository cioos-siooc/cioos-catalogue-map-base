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
import { useState } from "react";
import { getLocale } from "@/app/get-locale";

function getBadge(filterType, value, lang, removeBadge) {
  if (!value) return null; // Return null if value is empty
  const t = getLocale(lang);
  return (
    <div
      key={filterType}
      value={value}
      className="flex items-center bg-blue-100 text-black hover:text-black text-sm font-medium px-3 py-1 rounded-full shadow-md hover:bg-blue-200 transition duration-200"
    >
      <span>
        {filterType === "filter_date"
          ? `${t[filterType].toLowerCase()}: ${formatDateRangeWithoutTime(value)}`
          : `${t[filterType].toLowerCase()}: ${value}`}
      </span>
      <button
        className="ml-2 hover:text-white rounded-full p-1 transition duration-200"
        onClick={() => removeBadge(filterType)}
      >
        &times;
      </button>
    </div>
  );
}

// Helper function to format a date range string by removing the time
function formatDateRangeWithoutTime(value) {
  // Expects value like '2025-05-16T00:00:00Z%20TO%202025-05-17T00:00:00Z'
  if (!value) return "";
  const match = value.match(/(\d{4}-\d{2}-\d{2})T.*TO.*(\d{4}-\d{2}-\d{2})T/);
  if (match) {
    return `${match[1]} to ${match[2]}`;
  }
  // Fallback: remove time if present, and replace %20TO%20 with ' to '
  return value.replace(/T.*?Z/g, "").replace(/%20TO%20/i, " to ");
}

export function SearchFilter({ lang, setBadges }) {
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState("");

  const t = getLocale(lang);

  function onCloseModal() {
    setOpenModal(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      console.log("Enter pressed! Searching for:", query);
      // Close modal and add badge
      setBadges((prevBadges) => ({
        ...prevBadges,
        search: query,
      }));
      setOpenModal(false);
    }
  };

  return (
    <>
      <Button pill size="xs" onClick={() => setOpenModal(true)}>
        {t.search}
      </Button>
      <Modal
        dismissible
        show={openModal}
        size="xl"
        onClose={onCloseModal}
        popup
        className="dark:bg-primary-900 rounded-lg border-0 text-lg"
      >
        <FloatingLabel
          id="query-input"
          variant="filled"
          label={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="rounded-lg border-0 text-lg  peer-focus:text-black peer-focus:dark:text-white text-black dark:text-white"
        />
      </Modal>
    </>
  );
}

export function OptionItems(filter_type, orgList, projList, eovList) {
  if (filter_type === "organization") {
    return orgList.map((org) => (
      <option key={org} value={org}>
        {org}
      </option>
    ));
  } else if (filter_type === "projects") {
    return projList.map((proj) => (
      <option key={proj} value={proj}>
        {proj}
      </option>
    ));
  } else if (filter_type === "eov") {
    return eovList.map((eov) => (
      <option key={eov} value={eov}>
        {eov}
      </option>
    ));
  }
  return null;
}

function TimeFilter({ lang, setBadges, setSelectedOption }) {
  const [openModal, setOpenModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const t = getLocale(lang);

  function onCloseModal() {
    if (!startDate && !endDate) {
      setOpenModal(false);
      return;
    }
    // TODO: add first drowdown value inside the badge
    setBadges((prevBadges) => ({
      ...prevBadges,
      filter_date: `${startDate.toISOString().split(".")[0]}Z%20TO%20${endDate.toISOString().split(".")[0]}Z`,
    }));

    setOpenModal(false);
  }

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  return (
    <>
      <Button pill size="xs" onClick={() => setOpenModal(true)}>
        {t.time}
      </Button>
      <Modal
        dismissible
        show={openModal}
        size="3xl"
        onClose={onCloseModal}
        popup
        className="dark:bg-primary-900"
      >
        <ModalHeader>
          {t.filter_by} {t.time}
        </ModalHeader>
        <ModalBody className="overflow-visible flex flex-col gap-2 p-4">
          <div className="flex flex-row items-center gap-4">
            {/* Select component */}

            {/* Datepickers with labels above */}
            <div className="flex flex-col w-full">
              <div className="flex flex-row w-full gap-2">
                <div>
                  <span>{t.timefield}</span>
                  <Select
                    className="p-2 w-[220px] min-w-[180px]"
                    id="date-filter-type"
                    onChange={(e) => setSelectedOption(e.target.value)}
                  >
                    <option value="">{t.select}</option>
                    <option value="temporal-extent-begin">
                      temporal-extent-begin
                    </option>
                    <option value="temporal-extent-end">
                      temporal-extent-end
                    </option>
                    <option value="metadata_created">metadata_created</option>
                    <option value="metadata_updated">metadata_updated</option>
                  </Select>
                </div>
                <div>
                  <span>{t.from}</span>
                  <Datepicker
                    className="p-2 w-[calc(50%+20px)] min-w-[180px]"
                    language={`${lang}-CA`}
                    onChange={handleStartDateChange}
                    value={startDate}
                    selected={startDate}
                    maxDate={endDate || new Date()}
                    labelTodayButton={t.today}
                    labelClearButton={t.clear}
                    placeholder={t.start_date}
                  />
                </div>
                <div>
                  <span>{t.to}</span>
                  <Datepicker
                    className="p-2 w-[calc(50%+20px)] min-w-[180px]"
                    language={`${lang}-CA`}
                    onChange={handleEndDateChange}
                    value={endDate}
                    selected={endDate}
                    minDate={startDate} // Disable dates before the start date
                    maxDate={new Date()} // Disable future dates
                    labelTodayButton={t.today}
                    labelClearButton={t.clear}
                    placeholder={t.end_date}
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}

export function FilterItems({
  filter_type,
  lang,
  setBadges,
  orgList,
  projList,
  eovList,
}) {
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState("");
  const t = getLocale(lang);

  function onCloseModal() {
    if (!query) {
      setOpenModal(false);
      return;
    }
    setBadges((prevBadges) => ({
      ...prevBadges,
      [filter_type]: query,
    }));
    setOpenModal(false);
  }
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpenModal(false);
    }

    if (e.key === "Enter") {
      if (!query) {
        console.log("No query entered");
        return;
      }
      console.log("Enter pressed! Searching for:", query);
      // Close modal and add badge
      setBadges((prevBadges) => ({
        ...prevBadges,
        [filter_type]: query,
      }));

      setOpenModal(false);
    }
  };

  return (
    <>
      <Button pill size="xs" onClick={() => setOpenModal(true)}>
        {t[filter_type]}
      </Button>
      <Modal
        dismissible
        show={openModal}
        size="lg"
        onClose={onCloseModal}
        popup
        className="dark:bg-primary-900"
      >
        <ModalHeader>
          {t.filter_by} {t[filter_type].toLowerCase()}
        </ModalHeader>
        <ModalBody>
          <Select
            id={`${t[filter_type].toLowerCase()}-select`}
            onChange={(e) => setQuery(e.target.value)}
            onSelect={onCloseModal}
            onKeyDown={handleKeyDown}
          >
            <option value="">{t.select}</option>
            {OptionItems(filter_type, orgList, projList, eovList)}
          </Select>
        </ModalBody>
      </Modal>
    </>
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
}) {
  const t = getLocale(lang);

  const removeBadge = (filterType) => {
    setBadges((prevBadges) => {
      const updatedBadges = { ...prevBadges };
      delete updatedBadges[filterType];
      // Reset selected option if the filter type is "filter_date"
      if (filterType === "filter_date") {
        setSelectedOption("");
      }
      return updatedBadges;
    });
  };

  return (
    <>
      <span>{t.filters}</span>
      <div className="m-1 flex flex-row items-center gap-1 flex-wrap justify-center">
        <SearchFilter lang={lang} setBadges={setBadges} />
        <FilterItems
          filter_type="organization"
          lang={lang}
          setBadges={setBadges}
          orgList={orgList}
          projList={projList}
          eovList={eovList}
        />
        <FilterItems
          filter_type="projects"
          lang={lang}
          setBadges={setBadges}
          orgList={orgList}
          projList={projList}
          eovList={eovList}
        />
        <FilterItems
          filter_type="eov"
          lang={lang}
          setBadges={setBadges}
          orgList={orgList}
          projList={projList}
          eovList={eovList}
        />
        <TimeFilter
          lang={lang}
          setBadges={setBadges}
          setSelectedOption={setSelectedOption}
        />
      </div>

      {/* Render Badges */}
      <div className="m-1 pb-2 flex flex-wrap gap-1 justify-center">
        {Object.entries(badges).map(([filterType, value]) =>
          getBadge(filterType, value, lang, removeBadge),
        )}
      </div>
    </>
  );
}
