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
import { marked } from "marked";

/**
 * Converts Markdown to HTML (basic implementation).
 * @param {string} markdown - The Markdown input text.
 * @returns {string} The converted HTML string.
 */

function Item({ label, value, href, className = "" }) {
  if (!value) return null;
  return (
    <div className="group flex flex-row gap-2">
      {label ? <span>{label}:</span> : null}
      {href ? (
        <a
          href={href}
          target="_blank"
          className={`hover:underline ${className}`}
        >
          {value}
          <span className="ml-1 inline-flex h-2 w-2 items-baseline opacity-0 transition-opacity group-hover:opacity-100">
            <GoLinkExternal />
          </span>
        </a>
      ) : (
        <span
          className={`flex flex-row items-center gap-1 hover:underline ${className}`}
        >
          {value}
        </span>
      )}
    </div>
  );
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
  const describtion_html = DOMPurify.sanitize(
    marked(dataSetInfo?.notes_translated[lang]),
  );
  const citation = parseCitation(dataSetInfo?.citation[lang]);

  return (
    <Drawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      position="right"
      backdrop={false}
      className="bg-primary-50/50 dark:bg-primary-800/50 h-screen w-screen backdrop-blur-sm md:w-96 dark:text-white"
    >
      <DrawerItems className="flex h-full flex-grow flex-col overflow-y-auto">
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
              className="max-h-40 w-auto max-w-[300px] rounded-sm bg-white p-1"
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
          <div className="mt-4 flex flex-col gap-1">
            <Item
              value={dataSetInfo?.title_translated[lang]}
              href={citation?.URL}
              className="text-md font-bold"
            />
            <div className="text-xs">
              <Item
                value={dataSetInfo?.organization.title_translated[lang]}
                href={add_base_url(
                  dataSetInfo?.organization?.external_home_url,
                )}
              />
              <hr className="my-1 border-gray-800 dark:border-gray-200" />
              <Item
                label={t.source}
                value={citation?.URL.replace(/^https?:\/\//, "").split("/")[0]}
                href={citation?.URL}
              />
              <Item
                label={t.license}
                value={dataSetInfo?.license_title}
                href={dataSetInfo?.license_url}
              />
              <Item
                label="DOI"
                value={citation?.DOI}
                href={`https://doi.org/${citation?.DOI}`}
              />
            </div>
          </div>
        </div>

        <div
          className="prose relative mt-4 mb-4 flex-grow overflow-y-auto text-sm"
          id="dataset-description"
          dangerouslySetInnerHTML={{ __html: describtion_html }}
        ></div>
        <Citation dataSetInfo={dataSetInfo} lang={lang} />
      </DrawerItems>
    </Drawer>
  );
}
