import Image from "next/image";
import config from "@/app/config.js";

const isDarkMode = () => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false; // Default to light mode if window is undefined
};

const Logo = ({ logos, lang, default_width }) => {
  const language = lang || config.default_language; // Default to config's default language
  const darkMode = isDarkMode();

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
          className="h-auto"
          width={matchingLogo.width || default_width}
          height={0}
        />
      )}
    </div>
  );
};

export default Logo;
