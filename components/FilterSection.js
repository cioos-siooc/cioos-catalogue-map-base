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
import { format } from "date-fns";

function getBadge(filterType, value, lang, removeBadge) {
  if (!value) return null; // Return null if value is empty
  const t = getLocale(lang);
  return (
    <div
      key={filterType}
      value={value}
      className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-md hover:bg-blue-200 transition duration-200"
    >
      <span>
        {t[filterType].toLowerCase()}: {value}
      </span>
      <button
        className="ml-2 text-white bg-blue-500 hover:bg-blue-700 rounded-full p-1 transition duration-200"
        onClick={() => removeBadge(filterType)}
      >
        &times;
      </button>
    </div>
  );
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
        color="alternative"
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
      >
        <FloatingLabel
          id="query-input"
          variant="filled"
          label={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="rounded-lg border-0"
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

    setBadges((prevBadges) => ({
      ...prevBadges,
      start_date: startDate.toISOString().split(".")[0] + "Z",
    }));

    setBadges((prevBadges) => ({
      ...prevBadges,
      end_date: endDate.toISOString().split(".")[0] + "Z",
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
        color="alternative"
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
        className="rounded-lg shadow-lg border border-gray-300"
      >
        <ModalHeader className="bg-gray-100 text-gray-800 font-semibold">
          {t.filter_by} {t.time}
        </ModalHeader>
        <ModalBody className="overflow-visible flex flex-col gap-2 bg-white p-4 rounded-b-lg">
          <div className="flex flex-row items-center gap-4">
            {/* Select component */}

            {/* Datepickers with labels above */}
            <div className="flex flex-col w-full">
              <div className="flex flex-row w-full justify-between mb-1">
                <span className="font-medium w-1/5 text-center">
                  {t.timefield}
                </span>
                <span className="font-medium w-2/5 text-center">{t.from}</span>
                <span className="font-medium w-2/5 text-center">{t.to}</span>
              </div>
              <div className="flex flex-row w-full gap-2">
                <Select
                  className="border border-gray-300 rounded-md p-2 w-[220px] min-w-[180px]"
                  id="date-filter-type"
                  onChange={(e) => setSelectedOption(e.target.value)}
                >
                  <option value="">Select an option</option>
                  <option value="temporal-extent-begin">
                    temporal-extent-begin
                  </option>
                  <option value="temporal-extent-end">
                    temporal-extent-end
                  </option>
                  <option value="metadata_created">metadata_created</option>
                  <option value="metadata_updated">metadata_updated</option>
                </Select>
                <Datepicker
                  className="border border-gray-300 rounded-md p-2 w-[calc(50%+20px)] min-w-[180px]"
                  language={`${lang}-CA`}
                  onChange={handleStartDateChange}
                  value={startDate}
                  selected={startDate}
                  maxDate={endDate || new Date()}
                  labelTodayButton={t.today}
                  labelClearButton={t.clear}
                  placeholder={t.start_date}
                />
                <Datepicker
                  className="border border-gray-300 rounded-md p-2 w-[calc(50%+20px)] min-w-[180px]"
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
        </ModalBody>
      </Modal>
    </>
  );
}

function FilterItems({ filter_type, lang, setBadges }) {
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
      <Button
        color="alternative"
        pill
        size="xs"
        onClick={() => setOpenModal(true)}
      >
        {t[filter_type]}
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
          <Select
            id={`${t[filter_type].toLowerCase()}-select`}
            onChange={(e) => setQuery(e.target.value)}
            onSelect={onCloseModal}
            onKeyDown={handleKeyDown}
          >
            <option value="">Select an option</option>
            <option value="org-1">org-1</option>
            <option value="org-2">org-2</option>
            <option value="org-3">org-3</option>
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
  setSelectedOption,
}) {
  const t = getLocale(lang);

  const removeBadge = (filterType) => {
    setBadges((prevBadges) => {
      const updatedBadges = { ...prevBadges };
      delete updatedBadges[filterType];
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
        />
        <FilterItems filter_type="projects" lang={lang} setBadges={setBadges} />
        <FilterItems filter_type="eov" lang={lang} setBadges={setBadges} />
        <TimeFilter
          lang={lang}
          setBadges={setBadges}
          setSelectedOption={setSelectedOption}
        />
        <FilterItems filter_type="spatial" lang={lang} setBadges={setBadges} />
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
