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
import { IoFilterOutline } from "react-icons/io5";
import SidebarButton from "./SidebarButton";
import { SelectReactComponent } from "./SelectReact";
import { IoMdCloseCircle } from "react-icons/io";

// Helper function to format a date range string by removing the time
function formatDateRangeWithoutTime(value, t) {
  // Expects value like '2025-05-16T00:00:00Z%20TO%202025-05-17T00:00:00Z'
  if (!value) return "";
  const match = value.match(/(\d{4}-\d{2}-\d{2})T.*TO.*(\d{4}-\d{2}-\d{2})T/);
  if (match) {
    return `${match[1]} ${t.between_date} ${match[2]}`;
  }
  // Fallback: remove time if present, and replace %20TO%20 with ' to '
  return value; //.replace(/T.*?Z/g, "").replace(/%20TO%20/i, " to ");
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
      <Button
        className="bg-primary-500 hover:cursor-pointer"
        pill
        size="xs"
        onClick={() => setOpenModal(true)}
      >
        {t.search}
      </Button>
      <Modal
        dismissible
        show={openModal}
        size="xl"
        onClose={onCloseModal}
        popup
        className="rounded-lg border-0 text-lg"
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

    const strDates = `${formatDateRangeWithoutTime(startDate.toISOString(), t)}%20TO%20${formatDateRangeWithoutTime(endDate.toISOString(), t)}`;
    console.log("DATESSSSS :: ", strDates);
    setBadges((prevBadges) => ({
      ...prevBadges,
      filter_date: strDates,
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
      <Button
        className="bg-primary-500 hover:cursor-pointer"
        pill
        size="xs"
        onClick={() => setOpenModal(true)}
      >
        {t.time}
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
                    <option value="metadata_modified">metadata_modified</option>
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

export function FilterItems({ filter_type, lang, setBadges, options }) {
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState([]);
  const [count, setCount] = useState(0);
  const t = getLocale(lang);

  function onCloseModal() {
    if (query.length === 0) {
      // If no query is selected, close the modal without adding a badge
      console.log("No query entered, closing modal", query);
      setOpenModal(false);
      return;
    }
    setCount(query.length);
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
      if (query.length === 0) {
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

  const removeBadge = (filterType, setQuery) => {
    setBadges((prevBadges) => {
      console.log("Removing badge for filter type:", filterType);
      const updatedBadges = { ...prevBadges };
      delete updatedBadges[filterType];
      setQuery([]);
      setCount(0);
      // Reset selected option if the filter type is "filter_date"
      if (filterType === "filter_date") {
        setSelectedOption("");
      }
      // Update the URL with the new badges
      return updatedBadges;
    });
  };

  return (
    <>
      <Button
        pill
        size="xs"
        className="gap-1 bg-primary-500 hover:cursor-pointer"
        onClick={() => setOpenModal(true)}
      >
        {(count > 0 && (
          <>
            <span className="w-4 h-4 text-xs border-0 bg-accent-500 text-black rounded-full">
              {count}
            </span>
            <div>{t[filter_type]}</div>
            <span
              role="button"
              tabIndex={0}
              className="text-md hover:text-accent-500 bg-transparent border-0 p-0 m-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                removeBadge(filter_type, setQuery);
              }}
              aria-label={t.remove_filter}
            >
              <IoMdCloseCircle />
            </span>
          </>
        )) || <div>{t[filter_type]}</div>}
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
          />
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
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <>
      <SidebarButton
        logo={<IoFilterOutline />}
        label={t.filters}
        onClick={toggleAccordion}
      />
      <div
        className={`transition-all duration-300 ${isAccordionOpen ? "pt-1" : "max-h-0 hidden"}`}
      >
        <div className="flex flex-row items-center gap-1 flex-wrap justify-center">
          <SearchFilter lang={lang} setBadges={setBadges} />
          <FilterItems
            filter_type="organization"
            lang={lang}
            setBadges={setBadges}
            options={orgList.map((org) => ({ label: org, value: org }))} // Convert to array of tuples
          />
          <FilterItems
            filter_type="projects"
            lang={lang}
            setBadges={setBadges}
            options={projList.map((proj) => ({ label: proj, value: proj }))} // Convert to array of tuples
          />
          <FilterItems
            filter_type="eov"
            lang={lang}
            setBadges={setBadges}
            options={eovList.map((eov) => ({ label: eov[0], value: eov[1] }))} // Convert to array of tuples
          />
          <TimeFilter
            lang={lang}
            setBadges={setBadges}
            setSelectedOption={setSelectedOption}
          />
        </div>
      </div>
    </>
  );
}
