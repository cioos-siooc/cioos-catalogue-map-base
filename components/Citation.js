"use client";

import React, { useState, useEffect } from "react";
import Cite from "citation-js";


export default function Citation( {dataSetInfo, lang }) {
  // State to hold the formatted citation (HTML formatted)
  const [citationHtml, setCitationHtml] = useState("");
  const citationLanguage = lang === "fr" ? "fr-CA" : "en-CA";

  useEffect( () => {
    // Example bibliographic data in JSON format:

    try {
        // Create a new Cite instance with your bibliographic data
        if(dataSetInfo && dataSetInfo.citation) {
            const cleanedString = dataSetInfo.citation[lang].replace(/\\/g, "");
            const modifiedString = cleanedString.slice(1, -1);
            const cite = new Cite(modifiedString);
            // Format as a bibliography entry in APA style and output in HTML
            const formatted = cite.format("bibliography", {
                format: "html",
                template: "apa",
                lang: citationLanguage,
            });

            setCitationHtml(formatted);
        }else {
            console.log("Citation data is not available");
        }
      } catch (error) {
        console.error("Error formatting citation:", error);
      }
  }, [dataSetInfo, lang]);

  return (
    <>
      { citationHtml ? (
        // The citation is returned as HTML, so we use dangerouslySetInnerHTML to render it.
        <div dangerouslySetInnerHTML={{ __html: citationHtml }} />

        ) : (
        <p>Loading citation...</p>
        )
    }
    </>
  );
}
