
"use client";

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { useState } from "react";


export default function ModalAPropos() {
  const [openModal, setOpenModal] = useState(true);

  return (
    <>
      <Button color='dark' className="p-2 m-2" onClick={() => setOpenModal(true)}>À Propos</Button>
      <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader>À propos du catalogue cartographique</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Le catalogue cartographique est un outil d’exploration de données qui permet
              d’afficher les entrées du Catalogue de données de l’OGSL sur une carte, avec la
              possibilité de filtrer les résultats par variable océanique* tels que la température
              de surface de l’eau ou le phytoplancton. En cliquant sur les points de données et
              leur étendue géospatiale, le panneau latéral affiche les informations
              du jeu de données (titre, description, producteur de donnée et liens pour la page du
              Catalogue et les fichiers de données).
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </Modal>
    </>
  );
}
