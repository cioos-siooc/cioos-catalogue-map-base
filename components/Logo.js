import Image from "next/image";
import config from "@/app/config.js";

const basePath = process.env.BASE_PATH || "";
const Logo = (lang) => {
  return (
    <div>
      <div className="relative ml-15 w-32 h-32 md:w-16 md:h-16 lg:w-48 lg:h-16">
        <Image
          src={`${basePath}${config.bottom_logo[lang["lang"]]}`}
          className="h-auto dark:hidden"
          alt="CIOOS Logo"
          fill="true"
          object-fit="contain"
        />

        <Image
          src={`${basePath}${config.bottom_logo_dark[lang["lang"]]}`}
          className="h-auto hidden dark:block"
          alt="CIOOS Logo dark"
          fill="true"
          object-fit="contain"
        />
      </div>
    </div>
  );
};

export default Logo;
