"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  FloatingLabel,
  Select,
} from "flowbite-react";
import { useState } from "react";
import { getLocale } from "@/app/get-locale";

function getBadge(filterType, value, lang) {
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

export function FilterItems({ filter_type, lang, setBadges }) {
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

export default function FilterSection({ lang }) {
  const [badges, setBadges] = useState({});
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
      <div className="flex flex-row items-center gap-1 flex-wrap justify-center">
        <SearchFilter lang={lang} setBadges={setBadges} />
        <FilterItems
          filter_type="organization"
          lang={lang}
          setBadges={setBadges}
        />
        <FilterItems filter_type="project" lang={lang} setBadges={setBadges} />
        <FilterItems filter_type="eov" lang={lang} setBadges={setBadges} />
        <FilterItems filter_type="time" lang={lang} setBadges={setBadges} />
        <FilterItems
          filter_type="spatial"
          lang={lang}
          setBadges={setBadges}
        />
      </div>

      {/* Render Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(badges).map(([filterType, value]) => (
          getBadge(filterType, value, lang)
        ))}
      </div>
    </>
  );
}