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

        // Prioritize DOI, then fall back to URL
        let url = parsed_citation?.URL;
        if (parsed_citation?.DOI) {
          url = `https://doi.org/${parsed_citation.DOI}`;
        }
        setCitationURL(url);

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
      {citationHtml && (
        <div className="space-y-2 py-3">
          <h3 className="text-sm font-semibold">{t.citation}</h3>
          <a
            href={citationURL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-primary-50 hover:bg-primary-100 dark:bg-primary-800 dark:hover:bg-primary-700 flex items-start gap-2 rounded-md p-3 text-xs transition-colors"
          >
            <div className="flex-1">
              <SafeHTML content={citationHtml} />
            </div>
            <GoLinkExternal className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
          </a>
        </div>
      )}
    </>
  );
}
