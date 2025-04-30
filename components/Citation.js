"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Cite from "citation-js"; // Import Citation.js
import { HiMiniLink } from "react-icons/hi2";

export default function Citation( {dataSetInfo, lang }) {
  // State to hold the formatted citation (HTML formatted)
  const [citationHtml, setCitationHtml] = useState("");
  const [citationURL, setCitationURL] = useState("");

  const citationLanguage = lang === "fr" ? "fr-FR" : "en-US";

  useEffect( () => {
    // Example bibliographic data in JSON format:

    try {
        // Create a new Cite instance with your bibliographic data
        if(dataSetInfo && dataSetInfo.citation) {
            const cleanedString = dataSetInfo.citation[lang].replace(/\\/g, "");
            const modifiedString = cleanedString.slice(1, -1);
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
        }else {
            console.log("Citation data is not available");
        }
      } catch (error) {
        console.error("Error formatting citation:", error);
      }
  }, [dataSetInfo, lang]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 mt-5">
      { citationHtml ? (
        // The citation is returned as HTML, so we use dangerouslySetInnerHTML to render it.
        <div>
            <div dangerouslySetInnerHTML={{ __html: citationHtml }}>
            

            </div>
            <div className="mt-2">

               <Link href={citationURL} legacyBehavior>
                    <a style={{ color: 'blue', textDecoration: 'underline', fontSize: '12px' }}>
                        
                        <HiMiniLink />
                    </a>
                </Link>
            </div>
        </div>
        ) : (
        <p>Loading citation...</p>
        )
    }
    </div>
  );
}
