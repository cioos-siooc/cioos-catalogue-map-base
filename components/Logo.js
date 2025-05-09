import Image from "next/image";
import config from "@/app/config.js";

const basePath = process.env.BASE_PATH || "";
const Logo = (lang) => {
  let language = lang["lang"];
  const logoLightURL = config?.bottom_logo?.light[language];
  const logoDarkURL = config?.bottom_logo?.dark[language];

  return (
    <div>
      <div className="relative ml-15 w-32 h-32 md:w-16 md:h-16 lg:w-48 lg:h-16">
        {config.bottom_logo && (
          <>
            <Image
              src={`${basePath}${logoLightURL}`}
              className="h-auto dark:hidden"
              alt="CIOOS Logo"
              fill="true"
              object-fit="contain"
            />
            <Image
              src={`${basePath}${logoDarkURL}`}
              className="h-auto hidden dark:block"
              alt="CIOOS Logo dark"
              fill="true"
              object-fit="contain"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Logo;
