"use client";

import React, { useState, useEffect } from "react";
import Cite from "citation-js"; // Import Citation.js
import DOMPurify from "dompurify";
import { GoLinkExternal } from "react-icons/go";
import { getLocale } from "@/app/get-locale";

export function parseCitation(citation) {
  try {
    // Parse the citation JSON string
    const parsedCitation = JSON.parse(citation.replace(/\\"/g, '"'))[0];
    return parsedCitation;
  } catch (error) {
    console.error("Error parsing citation:", error);
    return null;
  }
}

export function Citation({ dataSetInfo, lang }) {
  // State to hold the formatted citation (HTML formatted)
  const [citationHtml, setCitationHtml] = useState("");
  const [citationURL, setCitationURL] = useState("");

  const citationLanguage = lang === "fr" ? "fr-CA" : "en-CA";
  const t = getLocale(lang);

  useEffect(() => {
    // Example bibliographic data in JSON format:

    try {
      // Create a new Cite instance with your bibliographic data
      if (dataSetInfo && dataSetInfo.citation) {
        const parsed_citation = parseCitation(dataSetInfo.citation[lang]);
        if (!parsed_citation) {
          console.error("Failed to parse citation data");
          setCitationHtml(null);
          return;
        }
        setCitationURL(parsed_citation?.URL);
        const cite = new Cite(parsed_citation);
        // Format as a bibliography entry in APA style and output in HTML
        const formatted = cite.format("bibliography", {
          format: "html",
          template: "apa",
          lang: citationLanguage,
        });

        setCitationHtml(formatted);
      } else {
        console.log("Citation data is not available");
      }
    } catch (error) {
      console.error("Error formatting citation:", error);
    }
  }, [dataSetInfo, lang, citationLanguage]);

  function SafeHTML({ content }) {
    const sanitizedContent = DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        "p",
        "b",
        "i",
        "em",
        "strong",
        "a",
        "ul",
        "ol",
        "li",
        "br",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
  }

  return (
    <>
      {citationHtml ? (
        // The citation is returned as HTML, so we use dangerouslySetInnerHTML to render it.
        <>
          <h3 className="mb-2 flex flex-row items-center gap-2 text-sm font-semibold">
            {t.citation} <GoLinkExternal />
          </h3>
          <a
            href={citationURL}
            className="bg-primary-50 dark:bg-primary-800 relative flex-shrink-0 rounded-md p-2 text-xs"
          >
            <SafeHTML content={citationHtml} />
          </a>
        </>
      ) : null}
    </>
  );
}
