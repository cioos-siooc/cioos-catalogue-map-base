import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import config from "@/app/config.js";
import { marked } from "marked";
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
        <Dialog
          key={idx}
          open={openKey === idx}
          onOpenChange={(open) => !open && setOpenKey(null)}
        >
          <DialogContent className="custom-scrollbar bg-background-light dark:bg-background-dark max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogTitle className="sr-only">Page Content</DialogTitle>
            <div
              className="prose prose-sm prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: htmlMap[idx] || "<span>Loading...</span>",
              }}
            />
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}
