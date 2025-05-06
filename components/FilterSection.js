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
      className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
    >
      <span>
        {t[filterType].toLowerCase()}: {value}
      </span>
      <button
        className="ml-2 text-white hover:text-blue-700"
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
        size="lg"
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

function TimeFilter({ lang, setBadges }) {
  const [openModal, setOpenModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const t = getLocale(lang);

  function onCloseModal() {
    if (!startDate && !endDate) {
      setOpenModal(false);
      return;
    }
    setBadges((prevBadges) => ({
      ...prevBadges,
      start_date: startDate,
    }));
    setBadges((prevBadges) => ({
      ...prevBadges,
      end_date: endDate,
    }));
    setOpenModal(false);
  }
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
        size="lg"
        onClose={onCloseModal}
        popup
      >
        <ModalHeader>
          {t.filter_by} {t.time}
        </ModalHeader>
        <ModalBody className="overflow-visible">
          <div className="w-full">
            <div className="m-2">{t.from}</div>
            <Datepicker
              language={`${lang}-CA`}
              className="w-1/3"
              onChange={(date) => setStartDate(date)}
            />
          </div>
          <div className="w-full">
            <div className="m-2">{t.to}</div>
            <Datepicker
              language={`${lang}-CA`}
              onChange={(date) => setEndDate(date)}
            />
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

export default function FilterSection({ lang, badges, setBadges }) {
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
        <TimeFilter lang={lang} setBadges={setBadges} />
        <FilterItems filter_type="spatial" lang={lang} setBadges={setBadges} />
      </div>

      {/* Render Badges */}
      <div className="m-1 pb-2 flex flex-wrap gap-1 justify-center">
        {console.log("badges length :: ", Object.entries(badges).length)}
        {Object.entries(badges).map(([filterType, value]) =>
          getBadge(filterType, value, lang, removeBadge),
        )}
      </div>
    </>
  );
}
