"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  FloatingLabel,
  Select,
} from "flowbite-react";
import { useRef, useState } from "react";
import { getLocale } from "@/app/get-locale";

export function SearchFilter({lang}) {
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState("");

  const t = getLocale(lang);
  function onCloseModal() {
    setOpenModal(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      console.log("Enter pressed! Searching for:", query);
      // close modal and add badge
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

export function FilterItems({ label }) {
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState("");

  function onCloseModal() {
    setOpenModal(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      console.log("Enter pressed! Searching for:", query);
      // close modal and add badge
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
        {label}
      </Button>
      <Modal
        dismissible
        show={openModal}
        size="lg"
        onClose={onCloseModal}
        popup
      >
        <ModalHeader>Filter by {label}</ModalHeader>
        <ModalBody>
          <Select id={`${label}-select`}>
            <option>org-1</option>
            <option>org-2</option>
            <option>org-3</option>
          </Select>
        </ModalBody>
      </Modal>
    </>
  );
}

export default function FilterSection({lang}) {
  const [badges, setBadges] = useState([]);
  const t = getLocale(lang);

  return (
    <>
      <span>Filtres</span>
      <div className="flex flex-row items-center gap-1 flex-wrap justify-center">
        <SearchFilter lang={lang} />
        <FilterItems label={t.organization} />
        <FilterItems label={t.project} />
        <FilterItems label={t.eov} />
        <FilterItems label={t.time} />
        <FilterItems label={t.spatial} />
      </div>
    </>
  );
}
