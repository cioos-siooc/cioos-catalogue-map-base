"use client";

import { Drawer, DrawerItems } from "flowbite-react";
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
import dynamic from "next/dynamic";

// Dynamically import MiniMap to avoid SSR issues with Leaflet
const MiniMap = dynamic(
  () => import("@/components/MiniMap").then((mod) => mod.MiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
    ),
  },
);

function MetadataItem({ label, value, href, className = "" }) {
  if (!value) return null;

  return (
    <div
      className={`flex items-start gap-1 text-xs font-semibold wrap-normal ${className}`}
    >
      {label && (
        <span className="text-gray-700 dark:text-gray-300">{label}:</span>
      )}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-600 dark:hover:text-primary-400 group inline-flex items-center gap-1 text-black hover:underline dark:text-white"
          title={value}
        >
          {value}
          <GoLinkExternal className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-70" />
        </a>
      ) : (
        <span className="text-black dark:text-white">{value}</span>
      )}
    </div>
  );
}

export function DatasetDetails({ dataSetInfo, lang }) {
  const { isDrawerOpen, closeDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  function resolveOrgImage(dataset, lang) {
    const org = dataset?.organization;
    if (!org) return null;
    // Prefer locally cached path if available
    if (org.image_local) {
      const cleanPath = org.image_local.replace(/^\//, "");
      return `${basePath}/${cleanPath}`;
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
      className="bg-background-light/50 dark:bg-background-dark/50 h-[100dvh] w-screen px-0 py-1 backdrop-blur-sm md:w-96 dark:text-white"
    >
      <DrawerItems className="flex h-full flex-grow flex-col overflow-y-auto px-4">
        <button
          className="absolute top-0 right-0 z-10 p-1"
          onClick={closeDrawer}
          aria-label="Close Dataset Details"
          title="Close Dataset Details"
        >
          <IoMdClose className="text-3xl" />
        </button>

        {/* Header Section */}
        <div className="shrink-0 space-y-2">
          {/* Organization Logo */}
          {dataSetInfo?.organization &&
            (() => {
              const img = resolveOrgImage(dataSetInfo, lang);
              return (
                img && (
                  <Image
                    className="max-h-40 w-auto max-w-xs rounded-sm bg-white p-1"
                    src={img}
                    alt={`${dataSetInfo.organization.title_translated[lang]} logo`}
                    width={0}
                    height={160}
                  />
                )
              );
            })()}

          {/* Dataset Title */}
          <h2 className="text-base font-bold text-black dark:text-white">
            {dataSetInfo?.title_translated[lang]}
          </h2>

          {/* Metadata Section */}
          <div className="bg-background-light dark:bg-background-dark space-y-1 rounded-md p-2 text-xs">
            {dataSetInfo?.organization && (
              <MetadataItem
                label={t.organization || "Organization"}
                value={dataSetInfo.organization.title_translated[lang]}
                href={add_base_url(
                  dataSetInfo?.organization?.external_home_url,
                )}
              />
            )}
            {dataSetInfo?.name && (
              <MetadataItem
                label="Catalogue"
                value={
                  config.catalogue_url.replace(/^https?:\/\//, "").split("/")[0]
                }
                href={`${config.catalogue_url}/dataset/${dataSetInfo.name}?local=${lang}`}
              />
            )}
            {(() => {
              const originDomain = citation?.URL?.replace(
                /^https?:\/\//,
                "",
              ).split("/")[0];
              const catalogueDomain = config.catalogue_url
                .replace(/^https?:\/\//, "")
                .split("/")[0];
              return (
                originDomain &&
                originDomain !== catalogueDomain && (
                  <MetadataItem
                    label="Origin"
                    value={originDomain}
                    href={citation?.URL}
                  />
                )
              );
            })()}
            {citation?.DOI && (
              <MetadataItem
                label="DOI"
                value={citation.DOI}
                href={`https://doi.org/${citation.DOI}`}
              />
            )}
            {dataSetInfo?.license_title && (
              <MetadataItem
                label={t.license || "License"}
                value={dataSetInfo.license_title}
                href={dataSetInfo?.license_url}
              />
            )}
          </div>
        </div>

        {/* View in Catalogue Button */}
        {dataSetInfo?.name && (
          <div className="shrink-0 py-3">
            <a
              href={`${config.catalogue_url}/dataset/${dataSetInfo.name}?local=${lang}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
            >
              {t.view_in_catalogue || "View in Catalogue"}
              <GoLinkExternal className="h-4 w-4 shrink-0" />
            </a>
          </div>
        )}

        {/* Spatial Coverage Map - Only show on mobile/full width */}
        {dataSetInfo?.spatial && (
          <div className="shrink-0 space-y-2 py-3 md:hidden">
            <h3 className="text-sm font-semibold">
              {t.spatial || "Spatial Coverage"}
            </h3>
            <MiniMap spatial={dataSetInfo.spatial} className="h-[200px]" />
          </div>
        )}

        {/* Description Section */}
        <div className="space-y-2 py-3">
          <h3 className="text-sm font-semibold">
            {t.description || "Description"}
          </h3>
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm text-black dark:text-white"
            id="dataset-description"
            dangerouslySetInnerHTML={{ __html: describtion_html }}
          ></div>
        </div>

        {/* Resources Section */}
        {dataSetInfo?.resources &&
          dataSetInfo.resources.length > 0 &&
          (() => {
            // Filter resources to show only current language or language-neutral ones
            const filteredResources = dataSetInfo.resources.filter(
              (resource) => {
                if (!resource.language) return true;
                if (Array.isArray(resource.language)) {
                  return resource.language.includes(lang);
                }
                return resource.language === lang;
              },
            );

            // Deduplicate resources by URL
            const uniqueResources = [];
            const seenUrls = new Set();
            filteredResources.forEach((resource) => {
              if (!seenUrls.has(resource.url)) {
                seenUrls.add(resource.url);
                uniqueResources.push(resource);
              }
            });

            return uniqueResources.length > 0 ? (
              <div className="space-y-2 py-3">
                <h3 className="text-sm font-semibold">{t.resources}</h3>
                <div className="flex flex-col gap-2">
                  {uniqueResources.map((resource, index) => {
                    const resourceName =
                      resource.name_translated?.[lang] || resource.name;
                    const resourceDesc =
                      resource.description_translated?.[lang] ||
                      resource.description;
                    return (
                      <a
                        key={resource.id || index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-background-light hover:bg-primary-100 dark:bg-background-dark dark:hover:bg-primary-700 flex items-start gap-2 rounded-md p-2 text-xs transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{resourceName}</span>
                            {resource.format && (
                              <span className="bg-primary-100 dark:bg-primary-700 rounded px-2 py-0.5 text-xs font-medium">
                                {resource.format}
                              </span>
                            )}
                          </div>
                          {resourceDesc && (
                            <p className="mt-1 opacity-75">{resourceDesc}</p>
                          )}
                        </div>
                        <GoLinkExternal className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null;
          })()}

        <Citation dataSetInfo={dataSetInfo} lang={lang} />
      </DrawerItems>
    </Drawer>
  );
}
