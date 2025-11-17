import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useEffect, useState } from "react";
import { MdInfoOutline } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import SidebarButton from "@/components/SidebarButton";
import config from "@/app/config.js";
import { marked } from "marked";
const basePath = process.env.BASE_PATH || "";
export default function ModalPages({ lang }) {
  const [openKey, setOpenKey] = useState(null);
  const [htmlMap, setHtmlMap] = useState({});

  const pages = Array.isArray(config.pages) ? config.pages : [];

  // Fetch markdown when a modal is opened
  useEffect(() => {
    if (openKey === null) return;
    const page = pages[openKey];
    if (!page) return;
    if (page.markdown_content && page.markdown_content[lang]) {
      fetch(basePath + page.markdown_content[lang])
        .then((res) => res.text())
        .then((md) =>
          setHtmlMap((prev) => ({ ...prev, [openKey]: marked.parse(md) })),
        )
        .catch(() =>
          setHtmlMap((prev) => ({
            ...prev,
            [openKey]:
              "<span class='text-red-500'>Error loading content</span>",
          })),
        );
    } else {
      setHtmlMap((prev) => ({
        ...prev,
        [openKey]: page.content?.[lang] || "",
      }));
    }
  }, [openKey, lang, pages]);

  return (
    <>
      {pages.map((page, idx) => (
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
            className="bg-primary-50/50 dark:bg-primary-900/50"
          >
            <div className="relative overflow-hidden rounded-lg">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpenKey(null)}
                className="absolute top-2 right-2 z-10 p-2 text-lg"
              >
                <IoMdClose />
              </button>
              <ModalBody className="bg-primary-50 dark:bg-primary-800">
                <div
                  className="prose prose-sm prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: htmlMap[idx] || "<span>Loading...</span>",
                  }}
                />
              </ModalBody>
            </div>
          </Modal>
        </div>
      ))}
    </>
  );
}
