"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useState } from "react";
import { getLocale } from "@/app/get-locale.js";
import { MdInfoOutline } from "react-icons/md";
import SidebarButton from "./SidebarButton";

export default function ModalAPropos(lang) {
  const [openModal, setOpenModal] = useState(true);
  const t = getLocale(lang["lang"]);

  return (
    <>
      <SidebarButton
        logo={<MdInfoOutline />}
        label={t.about}
        onClick={() => setOpenModal(true)}
      />
      <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader>{t.about_header}</ModalHeader>
        <ModalBody>
          <p className="space-y-6 text-base leading-relaxed">
            {t.about_text}
          </p>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>
    </>
  );
}
