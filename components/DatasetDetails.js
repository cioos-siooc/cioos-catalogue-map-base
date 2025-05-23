"use client";

import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { DrawerContext } from "../app/context/DrawerContext";
import Image from "next/image";
import Citation from "@/components/Citation";
import { useContext } from "react";
import { getLocale } from "@/app/get-locale.js";
import config from "@/app/config.js";
import DOMPurify from "dompurify";

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

  return (
    <>
      <Drawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        position="right"
        backdrop={false}
        className="bg-primary-50/75 dark:text-white h-screen w-sm flex flex-col"
      >
        <DrawerHeader titleIcon={() => <></>} className="flex-shrink-0" />
        <DrawerItems className="flex-grow overflow-y-auto flex flex-col">
          <div id="top" className="flex-shrink-0">
            {dataSetInfo && dataSetInfo.organization ? (
              <Image
                className="rounded-sm w-auto max-h-40 bg-white p-1"
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
              <h4 className="font-bold">
                {dataSetInfo?.title_translated[lang]}
              </h4>
              <p className="text-xs">
                {dataSetInfo?.organization.title_translated[lang]}
              </p>
              <hr className="border-gray-800 dark:border-gray-200" />
              <p className="text-xs">
                {t.license}: {dataSetInfo?.license_title}
              </p>
            </div>
          </div>

          <div
            className="relative flex-grow overflow-y-auto mt-4 mb-4 text-sm prose"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          ></div>
          <Citation dataSetInfo={dataSetInfo} lang={lang} />
        </DrawerItems>
      </Drawer>
    </>
  );
}
