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

export default function ModalAPropos(lang) {
  const [openModal, setOpenModal] = useState(true);
  const t = getLocale(lang["lang"]);

  return (
    <>
      <Button className="p-2 m-2 uppercase" onClick={() => setOpenModal(true)}>
        {t.about}
      </Button>
      <Modal
        className="dark:bg-primary-900"
        dismissible
        show={openModal}
        onClose={() => setOpenModal(false)}
      >
        <ModalHeader>À propos du catalogue cartographique</ModalHeader>
        <ModalBody>
          <p className="space-y-6 text-base leading-relaxed">
            Le catalogue cartographique est un outil d’exploration de données
            qui permet d’afficher les entrées du Catalogue de données de l’OGSL
            sur une carte, avec la possibilité de filtrer les résultats par
            variable océanique* tels que la température de surface de l’eau ou
            le phytoplancton. En cliquant sur les points de données et leur
            étendue géospatiale, le panneau latéral affiche les informations du
            jeu de données (titre, description, producteur de donnée et liens
            pour la page du Catalogue et les fichiers de données).
          </p>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>
    </>
  );
}
