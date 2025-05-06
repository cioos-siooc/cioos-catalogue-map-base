"use client";

import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { DrawerContext } from "../app/context/DrawerContext";
import Image from "next/image";
import Citation from "@/components/Citation";
import { useContext } from "react";
import { getLocale } from "@/app/get-locale.js";

export function DatasetDetails({ dataSetInfo, lang }) {
  const { isDrawerOpen, closeDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  return (
    <>
      <Drawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        position="right"
        backdrop={false}
        className="bg-primary-50/75 dark:bg-primary-900/75 h-screen w-sm flex flex-col"
      >
        <DrawerHeader titleIcon={() => <></>} className="flex-shrink-0" />
        <DrawerItems className="flex-grow overflow-y-auto flex flex-col">
          <div id="top" className="flex-shrink-0">
            {dataSetInfo && dataSetInfo.organization ? (
              <Image
                className="rounded-sm w-auto max-h-40 bg-white p-1"
                src={
                  dataSetInfo &&
                  dataSetInfo.organization.image_url_translated[lang]
                }
                alt="Organization Logo"
                width={0}
                height={40}
              />
            ) : (
              <p>No image available</p>
            )}

            <div className="flex flex-col gap-1 mt-4">
              <h4 className="font-bold">
                {dataSetInfo && dataSetInfo.title_translated[lang]}
              </h4>
              <a
                href={dataSetInfo && dataSetInfo.organization.external_home_url}
                className="text-xs text-gray-500"
              >
                {dataSetInfo && dataSetInfo.organization.title_translated[lang]}
              </a>
              <hr className="border-gray-800 dark:border-gray-200" />
              <p className="text-xs">
                {t.license}: {dataSetInfo && dataSetInfo.license_title}
              </p>
            </div>
          </div>

          <div className="relative flex-grow overflow-y-auto mt-4 mb-4 text-sm">
            {dataSetInfo && dataSetInfo.notes_translated[lang]}
          </div>
          <Citation dataSetInfo={dataSetInfo} lang={lang} />
        </DrawerItems>
      </Drawer>
    </>
  );
}
