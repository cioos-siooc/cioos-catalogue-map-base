import Image from 'next/image';
import config from "@/app/config.js";

const basePath = process.env.BASE_PATH || "";

const Logo = () => {
    return (
        <div className="relative w-32 h-32 md:w-16 md:h-16 lg:w-48 lg:h-32">
            <Image
                src={`${basePath}${config.logo_default}`}
                className="h-auto dark:hidden"
                alt="OGSL Logo"
                fill="true" 
                object-fit="contain"
            />
            <Image
                src={`${basePath}${config.logos.rqm_dark}`}
                className="h-auto hidden dark:block"
                alt="OGSL Logo"
                fill="true" 
                object-fit="contain"
            />
        </div>
    );
};

export default Logo;

