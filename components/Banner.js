"use client";

import config from "@/app/config.js";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

/**
 * Banner component that displays a temporary message with optional expiration date
 * Configuration is read from config.banner
 * Supports markdown formatting in the message content
 */
export function Banner({ lang }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner is configured and enabled
    if (!config.banner || !config.banner.enabled) {
      setIsVisible(false);
      return;
    }

    // Check if user has dismissed the banner in this session
    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    // Check if banner has expired
    if (config.banner.expires) {
      const expiryDate = new Date(config.banner.expires);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison

      if (today > expiryDate) {
        setIsVisible(false);
        return;
      }
    }

    // Check if there's a message for the current language
    if (!config.banner.message || !config.banner.message[lang]) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
  }, [lang, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!isVisible) return null;

  // Convert markdown to HTML and sanitize
  const messageHtml = DOMPurify.sanitize(
    marked(config.banner.message[lang] || "", {
      breaks: true,
      gfm: true,
    }),
  );

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-40 flex w-auto max-w-[90%] -translate-x-1/2 items-center justify-between gap-2 rounded-lg px-4 py-2 text-sm shadow-md transition-all duration-300 md:top-4 md:bottom-auto md:z-50 md:max-w-2xl ${config.banner.className || "bg-accent-500 text-black"}`}
    >
      <div
        className="banner-content flex-1 text-center [&_a]:underline [&_a]:hover:opacity-80 [&_p]:m-0"
        dangerouslySetInnerHTML={{ __html: messageHtml }}
      />
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70"
        aria-label="Close banner"
        title="Close banner"
      >
        <MdClose className="text-xl" />
      </button>
    </div>
  );
}
