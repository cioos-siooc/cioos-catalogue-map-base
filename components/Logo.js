import Image from "next/image";
import config from "@/app/config.js";

const basePath = process.env.BASE_PATH || "";
const Logo = (lang) => {
  let language = lang["lang"];
  const logoLightURL = config?.bottom_logo?.light[language];
  const logoDarkURL = config?.bottom_logo?.dark[language];

  return (
    <div>
      <div className="flex flex-col items-center justify-center m-2">
        {config.bottom_logo && (
          <>
            <Image
              src={`${basePath}${logoLightURL}`}
              className="h-auto dark:hidden"
              alt="Base logo"
              width={220}
              height={0}
            />
            <Image
              src={`${basePath}${logoDarkURL}`}
              className="h-auto hidden dark:block"
              alt="Base logo"
              width={220}
              height={30}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Logo;
