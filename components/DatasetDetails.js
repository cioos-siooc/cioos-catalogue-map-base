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
          <span className="ml-1 inline-flex h-2 w-2 items-baseline">
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

  function resolveOrgImage(dataset, lang) {
    const org = dataset?.organization;
    if (!org) return null;
    // Prefer locally cached path if available
    if (org.image_local) {
      return `/${org.image_local.replace(/^\//, "")}`;
    }
    // Fallback to translated image URL if provided in the original structure
    const translated = org?.image_url_translated?.[lang];
    if (translated && !translated.startsWith("http")) {
      return config.catalogue_url + translated;
    }
    return translated || org.image_url || null;
  }

  // Reintroduce helper removed earlier, used for external_home_url links
  function add_base_url(url) {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = config.catalogue_url?.replace(/\/$/, "") || "";
    const cleaned = String(url).replace(/^\//, "");
    return `${base}/${cleaned}`;
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
      <DrawerItems className="custom-scrollbar flex h-full flex-grow flex-col overflow-y-auto">
        <button
          className="absolute top-0 right-0 z-10 p-4"
          onClick={closeDrawer}
          aria-label="Close Dataset Details"
          title="Close Dataset Details"
        >
          <IoMdClose className="text-3xl" />
        </button>
        <div id="top" className="flex-shrink-0 pr-12">
          {dataSetInfo && dataSetInfo.organization ? (
            (() => {
              const img = resolveOrgImage(dataSetInfo, lang);
              return img ? (
                <Image
                  className="max-h-40 w-auto max-w-[300px] rounded-sm bg-white p-1"
                  src={img}
                  alt="Organization Logo"
                  width={0}
                  height={40}
                />
              ) : (
                <p>No image available</p>
              );
            })()
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

          {/* View in Catalogue Button */}
          <a
            href={`${config.catalogue_url}/dataset/${dataSetInfo?.name}?local=${lang}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 mt-4 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {t.view_in_catalogue}
            <GoLinkExternal className="h-4 w-4" />
          </a>
        </div>

        <div
          className="prose prose-sm dark:prose-invert relative mt-4 mb-4 max-w-none flex-grow text-black dark:text-white"
          id="dataset-description"
          dangerouslySetInnerHTML={{ __html: describtion_html }}
        ></div>
        <Citation dataSetInfo={dataSetInfo} lang={lang} />
      </DrawerItems>
    </Drawer>
  );
}
