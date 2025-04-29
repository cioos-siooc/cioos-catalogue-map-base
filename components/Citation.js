"use client";

import React, { useState, useEffect } from "react";
import Cite from "citation-js"; // Import Citation.js

export default function Citation( {dataSetInfo, lang }) {
  // State to hold the formatted citation (HTML formatted)
  const [citationHtml, setCitationHtml] = useState("");

  useEffect( () => {
    // Example bibliographic data in JSON format:

    try {
        // Create a new Cite instance with your bibliographic data
        if(dataSetInfo && dataSetInfo.citation) {
            console.log("CITATION DATA :: ", dataSetInfo.citation[lang]);
            const cit = JSON.parse(dataSetInfo.citation[lang]);
            console.log("CITATION JSON :: ", cit);
            const cite = new Cite(dataSetInfo.citation[lang]);
            console.log("CITE :: ", cite);
            // Format as a bibliography entry in APA style and output in HTML
            const formatted = cite.format("bibliography", {
            format: "html",
            template: "apa",
            lang: "en-US"
            });
            console.log("CITATION :: ", formatted);
            setCitationHtml(formatted);
        }else {
            console.log("Citation data is not available");
        }
      } catch (error) {
        console.error("Error formatting citation:", error);
      }
  }, [dataSetInfo, lang]);

  return (
    <div className="p-8">
      <h4 className="text-2xl font-bold mb-4">
        Citation.js Example in Next.js
      </h4>
      { citationHtml ? (
        // The citation is returned as HTML, so we use dangerouslySetInnerHTML to render it.
        <div dangerouslySetInnerHTML={{ __html: citationHtml }} />
        ) : (
        <p>Loading citation...</p>
        )
    }
    </div>
  );
}
