import config from "@/app/config.js";
import { Modal, ModalBody } from "flowbite-react";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
const basePath = process.env.BASE_PATH || "";
export default function ModalPages({
  lang,
  openKey: externalOpenKey,
  setOpenKey: externalSetOpenKey,
}) {
  const [internalOpenKey, setInternalOpenKey] = useState(null);
  const [htmlMap, setHtmlMap] = useState({});

  // Use external state if provided, otherwise use internal state
  const openKey =
    externalOpenKey !== undefined ? externalOpenKey : internalOpenKey;
  const setOpenKey = externalSetOpenKey || setInternalOpenKey;

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
          <Modal
            dismissible
            show={openKey === idx}
            onClose={() => setOpenKey(null)}
            className="bg-neutral-900/75"
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
              <ModalBody className="bg-background-light dark:bg-background-dark custom-scrollbar max-h-[90vh] overflow-y-auto">
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
