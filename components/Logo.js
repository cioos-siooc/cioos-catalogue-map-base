import Image from "next/image";
import { useEffect, useState } from "react";
import config from "@/app/config.js";

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

  // Handle undefined logos
  const availableLogos = logos || config.bottom_logo || [];

  // Find the matching logo based on language and mode
  const matchingLogo = availableLogos.find(
    (logo) =>
      (logo.lang === language || !logo.lang) &&
      ((force_mode ? force_mode === "dark" : darkMode)
        ? logo.mode === "dark"
        : logo.mode === "light"),
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
