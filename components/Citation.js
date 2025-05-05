"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Cite from "citation-js"; // Import Citation.js
import { HiMiniLink } from "react-icons/hi2";
import DOMPurify from "dompurify";
import { GoLinkExternal } from "react-icons/go";
import { getLocale } from "@/app/get-locale";

export default function Citation({ dataSetInfo, lang }) {
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
        const cleanedString = dataSetInfo.citation[lang].replace(/\\/g, "");
        let modifiedString = cleanedString.slice(1, -1);
        console.log("Modified String before :: ", modifiedString);
        modifiedString = decodeUnicode(modifiedString);
        console.log("Modified String After :: ", modifiedString);
        const json = JSON.parse(modifiedString);
        setCitationURL(json.URL);
        const cite = new Cite(modifiedString);
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
  }, [dataSetInfo, lang]);

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

  function decodeUnicode(str) {
    return str.replace(/u([\dA-Fa-f]{4})/g, (match, code) =>
      String.fromCharCode(parseInt(code, 16)),
    );
  }

  return (
    <>
      {citationHtml ? (
        // The citation is returned as HTML, so we use dangerouslySetInnerHTML to render it.
        <a
          href={citationURL}
          className="flex-shrink-0 relative text-xs p-1 border-gray-200 border-2 rounded-md mt-4"
        >
          <SafeHTML content={citationHtml} />
          <div className="absolute -top-4 flex flex-row gap-1 text-xs items-center rounded-md">
            {t.citation} <GoLinkExternal />
          </div>
        </a>
      ) : (
        <p>Loading citation...</p>
      )}
    </>
  );
}
