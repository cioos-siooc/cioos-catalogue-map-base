"use client";

import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { DrawerContext } from "../app/context/DrawerContext";
import Image from "next/image";
import { parseCitation, Citation } from "@/components/Citation";
import { useContext } from "react";
import { getLocale } from "@/app/get-locale.js";
import config from "@/app/config.js";
import DOMPurify from "dompurify";
import { IoMdClose } from "react-icons/io";
import { GoLinkExternal } from "react-icons/go";

/**
 * Converts Markdown to HTML (basic implementation).
 * @param {string} markdown - The Markdown input text.
 * @returns {string} The converted HTML string.
 */
function markdownToHtml(markdown) {
  if (!markdown) return "";
  return markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
    .replace(/\*(.*)\*/gim, "<i>$1</i>")
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n$/gim, "<br>");
}

export function DatasetDetails({ dataSetInfo, lang }) {
  const { isDrawerOpen, closeDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  function add_base_url(url) {
    if (url && !url.startsWith("http")) {
      return config.catalogue_url + url;
    }
    return url;
  }

  // Convert and sanitize Markdown content
  const sanitizedHtml = DOMPurify.sanitize(
    markdownToHtml(dataSetInfo?.notes_translated[lang]),
  );
  const citation = parseCitation(dataSetInfo?.citation[lang]);
  const source_label =
    citation?.doi || citation?.URL.replace(/^https?:\/\//, "").split("/")[0];

  return (
    <Drawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      position="right"
      backdrop={false}
      className="bg-primary-50/50 dark:text-white dark:bg-primary-800/50 backdrop-blur-sm h-screen w-screen md:w-96"
    >
      <DrawerItems className="flex-grow overflow-y-auto flex flex-col h-full">
        <button
          className="absolute top-0 right-0 p-4"
          onClick={closeDrawer}
          aria-label="Close Dataset Details"
          title="Close Dataset Details"
        >
          <IoMdClose />
        </button>
        <div id="top" className="flex-shrink-0">
          {dataSetInfo && dataSetInfo.organization ? (
            <Image
              className="rounded-sm w-auto max-h-40 max-w-[300px] bg-white p-1"
              src={add_base_url(
                dataSetInfo?.organization?.image_url_translated[lang],
              )}
              alt="Organization Logo"
              width={0}
              height={40}
            />
          ) : (
            <p>No image available</p>
          )}
          <div className="flex flex-col gap-1 mt-4">
            <h4 className="font-bold">{dataSetInfo?.title_translated[lang]}</h4>
            <p className="text-xs">
              {dataSetInfo?.organization.title_translated[lang]}
            </p>
            <hr className="border-gray-800 dark:border-gray-200" />
            <p className="text-xs">
              {t.source}:{" "}
              <a
                href={citation.URL}
                title={citation.URL}
                target="_blank"
                className="text-primary-500 hover:underline"
              >
                {source_label}
              </a>
              <br />
              {t.license}:{" "}
              <a
                href={dataSetInfo?.license_url}
                target="_blank"
                className="hover:text-primary-500 hover:underline"
              >
                {dataSetInfo?.license_title}
              </a>
            </p>
          </div>
        </div>

        <div
          className="relative flex-grow overflow-y-auto mt-4 mb-4 text-sm prose"
          id="dataset-description"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        ></div>
        <Citation dataSetInfo={dataSetInfo} lang={lang} />
      </DrawerItems>
    </Drawer>
  );
}
