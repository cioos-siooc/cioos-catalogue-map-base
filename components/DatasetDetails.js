
"use client";

import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { DrawerContext } from "../app/context/DrawerContext";
import Image from 'next/image';
import Citation from "@/components/Citation";
import {useContext} from "react";
import { getLocale } from "@/app/get-locale.js";


export function DatasetDetails({ dataSetInfo, lang}) {

  const {isDrawerOpen, closeDrawer} = useContext(DrawerContext);
    console.log("DatasetDetails :: ", dataSetInfo);
    const t = getLocale(lang);

    return (
        <>
        <Drawer open={isDrawerOpen} onClose={closeDrawer} position="right" backdrop={false} className="bg-primary-50/75 dark:bg-primary-900/75 h-screen w-sm" >
            <DrawerHeader titleIcon={() => <></>}/>
                <DrawerItems>
                    {dataSetInfo && dataSetInfo.organization ? (
                    <Image
                        className="rounded-sm w-auto w-max-[200px] h-max-[50px] bg-white"
                        src={dataSetInfo && dataSetInfo.organization.image_url_translated[lang]}
                        alt="Organization Logo"
                        width={0}
                        height={50}
                    />
                    ) : (
                    <p>No image available</p>
                    )}

                    <div className="flex flex-col gap-1">
                        <h4 className="mt-2 font-bold">{dataSetInfo && dataSetInfo.title_translated[lang]}</h4>
                        <hr className="border-gray-800 dark:border-gray-200" />
                        <p className="text-xs">
                               {t.license}: {dataSetInfo && dataSetInfo.license_title}
                        </p>

                        <div className="text-sm overflow-auto mt-4 mb-4">
                            {dataSetInfo && dataSetInfo.notes_translated[lang]}
                        </div>
                        <div className="text-xs p-2 border-gray-200 border-2 rounded-md">
                            <Citation dataSetInfo={dataSetInfo} lang={lang} />
                        </div>
                    </div>
                </DrawerItems>
        </Drawer>
        </>
    );
    
}
