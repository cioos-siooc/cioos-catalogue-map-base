import Image from "next/image";
import { useEffect, useState } from "react";
import config from "@/app/config.js";

const Logo = ({ logos, lang, default_width }) => {
  const [darkMode, setDarkMode] = useState(false); // Default to light mode
  const language = lang || config.default_language; // Default to config's default language

  useEffect(() => {
    // Detect dark mode on the client side
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mediaQuery.matches);

    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Find the matching logo based on language and mode
  const matchingLogo = logos.find(
    (logo) =>
      (logo.lang === language || !logo.lang) &&
      (darkMode ? logo.mode === "dark" : logo.mode === "light"),
  );

  // Fallback to the first logo if no match is found
  const logoURL = matchingLogo ? matchingLogo.url : config.bottom_logo[0]?.url;
  const logoAlt = matchingLogo ? matchingLogo.alt : "Default Logo";

  return (
    <div className="flex flex-col items-center justify-center m-2">
      {logoURL && (
        <Image
          src={logoURL}
          alt={logoAlt}
          className={matchingLogo?.className || "h-auto"}
          width={matchingLogo?.width || default_width}
          height={0}
        />
      )}
    </div>
  );
};

export default Logo;
