import Image from "next/image";
import { useEffect, useState } from "react";
import config from "@/app/config.js";

/**
 * A React component that renders a logo based on the provided language, mode, and available logos.
 * It supports automatic detection of dark mode or a forced mode, and selects the appropriate logo accordingly.
 *
 * @param {Object[]} logos - An array of logo objects, each containing `url`, `alt`, `lang`, `mode`, and optional `className` and `width`.
 * @param {string} [lang] - The language code to match logos with. Defaults to the application's default language.
 * @param {number} [default_width] - The default width of the logo if not specified in the matching logo object.
 * @param {string} [force_mode] - Forces the mode to either "dark" or "light". If not provided, the mode is determined by the user's system preferences.
 *
 * @returns {JSX.Element} The rendered logo image or nothing if no logo is available.
 */
const Logo = ({ logos, lang, default_width, force_mode }) => {
  const [darkMode, setDarkMode] = useState(false); // Default to light mode
  const language = lang || config.default_language; // Default to config's default language

  useEffect(() => {
    if (!force_mode) {
      // Detect dark mode on the client side
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setDarkMode(mediaQuery.matches);

      const handleChange = (e) => setDarkMode(e.matches);
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      // Force mode if provided
      setDarkMode(force_mode === "dark");
    }
  }, [force_mode]);

  // Handle undefined logos by falling back to config's bottom_logo or an empty array
  const availableLogos = logos || config.bottom_logo || [];

  // Find the matching logo based on language and mode
  const matchingLogo = availableLogos.find(
    (logo) =>
      // Match logo language with the provided language or allow logos without a language
      (logo.lang === language || !logo.lang) &&
      // Match logo mode based on darkMode or force_mode
      ((force_mode ? force_mode === "dark" : darkMode)
        ? logo.mode === "dark" // Use dark mode logo if darkMode or force_mode is dark
        : logo.mode === "light"), // Use light mode logo otherwise
  );

  // Fallback to the first logo if no match is found
  const logoURL = matchingLogo ? matchingLogo.url : availableLogos[0]?.url;
  const logoAlt = matchingLogo ? matchingLogo.alt : "Default Logo";

  return (
    <>
      {logoURL && (
        <Image
          src={logoURL}
          alt={logoAlt}
          className={matchingLogo?.className || "h-auto"}
          width={matchingLogo?.width || default_width}
          height={0}
        />
      )}
    </>
  );
};

export default Logo;
