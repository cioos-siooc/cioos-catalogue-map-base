"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  FloatingLabel,
  Select,
} from "flowbite-react";
import { useState, useEffect, useContext } from "react";
import { getLocale } from "@/app/get-locale";
import { DrawerContext } from "@/app/context/DrawerContext";

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

export function FilterItems({ filter_type, lang, setBadges }) {
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

// Generate a UI for a bounding box ui filter to define the north, south, east, and west coordinates limits

function BoundingBoxFilter({ lang, setBadges }) {
  const { boundingBox, setBoundingBox } = useContext(DrawerContext);
  const [openModal, setOpenModal] = useState(false);
  // Initialize state with current boundingBox values
  const [north, setNorth] = useState(boundingBox ? boundingBox[1][0] : 90);
  const [south, setSouth] = useState(boundingBox ? boundingBox[0][0] : -90);
  const [east, setEast] = useState(boundingBox ? boundingBox[1][1] : 180);
  const [west, setWest] = useState(boundingBox ? boundingBox[0][1] : -180);

  const t = getLocale(lang);

  // Sync the context boundingBox whenever inputs change
  useEffect(() => {
    setBoundingBox([
      [south, west],
      [north, east],
    ]);
  }, [north, south, east, west, setBoundingBox]);

  function onCloseModal() {
    if (!north || !south || !east || !west) {
      setOpenModal(false);
      return;
    }
    setBadges((prevBadges) => ({
      ...prevBadges,
      bounding_box: `[${north}, ${south}, ${east}, ${west}]`,
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
        {t.spatial}
      </Button>
      <Modal
        dismissible
        show={openModal}
        size="lg"
        onClose={onCloseModal}
        popup
      >
        <ModalHeader>
          {t.filter_by} {t.spatial.toLowerCase()}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="text-sm">
              <div className="text-center">{t.north}</div>
              <input
                type="number"
                className="rounded-lg border-0 p-2 focus:ring-2 bg-gray-50 text-center"
                placeholder={t.north}
                value={north}
                onChange={(e) => setNorth(parseFloat(e.target.value))}
              />
            </div>
            <div className="text-sm flex flex-row gap-2">
              <div>{t.west}</div>
              <input
                type="number"
                className="rounded-lg border-0 p-2 focus:ring-2 bg-gray-50 text-center"
                placeholder={t.west}
                value={west}
                onChange={(e) => setWest(parseFloat(e.target.value))}
              />
              <input
                type="number"
                className="rounded-lg border-0 p-2 focus:ring-2 bg-gray-50 text-center"
                placeholder={t.east}
                value={east}
                onChange={(e) => setEast(parseFloat(e.target.value))}
              />
              <div>{t.east}</div>
            </div>
            <div className="text-sm">
              <input
                type="number"
                className="rounded-lg border-0 p-2 focus:ring-2 bg-gray-50 text-center"
                placeholder={t.south}
                value={south}
                onChange={(e) => setSouth(parseFloat(e.target.value))}
              />
              <div className="text-center">{t.south}</div>
            </div>
          </div>
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
        <FilterItems filter_type="time" lang={lang} setBadges={setBadges} />
        <BoundingBoxFilter lang={lang} setBadges={setBadges} />
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
