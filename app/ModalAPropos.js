"use client";

import { Modal, ModalBody, ModalFooter } from "flowbite-react";
import { useState } from "react";
import { MdInfoOutline } from "react-icons/md";
import SidebarButton from "@/components/SidebarButton";
import config from "./config.js";

console.log("Loaded config:", config);

export default function ModalAPropos({ lang }) {
  // Track which modal is open by index (null = none open)
  const [openKey, setOpenKey] = useState(null);

  // Defensive: ensure config.pages is an array
  const pages = Array.isArray(config.pages) ? config.pages : [];

  if (!pages.length) {
    return <div className="text-red-500">No info pages found in config.</div>;
  }

  return (
    <>
      {pages.map((page, idx) => {
        return (
          <div key={idx}>
            <SidebarButton
              logo={<MdInfoOutline />}
              label={page.label[lang]}
              onClick={() => setOpenKey(idx)}
            />
            <Modal
              dismissible
              show={openKey === idx}
              onClose={() => setOpenKey(null)}
            >
              <ModalBody>{page.content[lang]}</ModalBody>
            </Modal>
          </div>
        );
      })}
    </>
  );
}
