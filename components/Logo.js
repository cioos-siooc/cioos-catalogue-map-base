import Image from "next/image";
import { useEffect, useState } from "react";
import config from "@/app/config.js";

const basePath = process.env.BASE_PATH || "";

/**
 * A React component that renders a logo based on the provided language, mode, and available logos.
 * It supports automatic detection of dark mode or a forced mode, and selects the appropriate logo accordingly.
 *
 * @component
 * @param {Object[]} logos - An array of logo objects, each containing `url`, `alt`, `lang`, `mode`, and optional `className` and `width`.
 * @param {string} [logos[].url] - The URL of the logo image.
 * @param {string} [logos[].alt] - The alt text for the logo image.
 * @param {string} [logos[].lang] - The language code associated with the logo.
 * @param {string} [logos[].mode] - The mode of the logo, either "dark" or "light".
 * @param {string} [logos[].className] - Optional CSS class name for the logo image.
 * @param {number} [logos[].width] - Optional width of the logo image.
 * @param {string} [logos[].link] - Optional link URL for the logo image.
 * @param {string} [lang] - The language code to match logos with. Defaults to the application's default language.
 * @param {number} [default_width] - The default width of the logo if not specified in the matching logo object.
 * @param {string} [force_mode] - Forces the mode to either "dark" or "light". If not provided, the mode is determined by the user's system preferences.
 *
 * @returns {JSX.Element} The rendered logo image or nothing if no logo is available.
 *
 * @example
 * // Example usage of the Logo component
 * const logos = [
 *   { url: "/logo-light.png", alt: "Light Logo", lang: "en", mode: "light" },
 *   { url: "/logo-dark.png", alt: "Dark Logo", lang: "en", mode: "dark" },
 * ];
 *
 * <Logo logos={logos} lang="en" default_width={100} force_mode="dark" />
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
  const logoURL = matchingLogo
    ? matchingLogo.url.startsWith("/")
      ? `${basePath}${matchingLogo.url}` // Prepend basePath if the URL starts with "/"
      : matchingLogo.url
    : availableLogos[0]?.url;
  const logoAlt = matchingLogo ? matchingLogo.alt : "Default Logo";

  return (
    <>
      {logoURL && (
        <a
          href={matchingLogo?.link || undefined}
          target={matchingLogo?.link ? "_blank" : undefined}
          rel={matchingLogo?.link ? "noopener noreferrer" : undefined}
        >
          <Image
            src={logoURL}
            alt={logoAlt}
            className={
              matchingLogo?.className || "m-3 h-[6vh] max-h-[65px] w-auto"
            }
            width={matchingLogo?.width || default_width}
            height={0}
          />
        </a>
      )}
    </>
  );
};

export default Logo;
