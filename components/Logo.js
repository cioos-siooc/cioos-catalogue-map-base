import Image from "next/image";
import config from "@/app/config.js";

const basePath = process.env.BASE_PATH || "";
console.log("URL IMAGE :: ", `${basePath}${config.logo_default["en"]}`);
const Logo = (lang) => {
  return (
    <div className="relative ml-15 w-32 h-32 md:w-16 md:h-16 lg:w-48 lg:h-16">
      {console.log("LANGUAGE :: ", lang["lang"])}
      <Image
        src={`${basePath}${config.logo_default[lang["lang"]]}`}
        className="h-auto dark:hidden"
        alt="OGSL Logo"
        fill="true"
        object-fit="contain"
      />
    </div>
  );
};

export default Logo;
