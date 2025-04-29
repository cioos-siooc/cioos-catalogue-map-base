
"use client";

import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { useDrawer } from "../app/context/DrawerContext";
import Image from 'next/image';
import Citation from "@/components/Citation";


export function DatasetDetails({ dataSetInfo, lang}) {

  const {isDrawerOpen, closeDrawer} = useDrawer();


  console.log("DATASET INFO :: ", dataSetInfo);

    return (
        <>
        <Drawer open={isDrawerOpen} onClose={closeDrawer} position="right">
            <DrawerItems>

                {dataSetInfo && dataSetInfo.organization ? (
                <Image
                    className="mb-3 h-30 w-30 rounded-lg"
                    src={dataSetInfo && dataSetInfo.organization.image_url_translated[lang]}
                    alt="Organization Logo"
                    width={30}
                    height={30}
                />
                ) : (
                <p>No image available</p>
                )}
                <h4 className="text-sm font-bold mb-5">{dataSetInfo && dataSetInfo.title_translated[lang]}</h4>

                <p className="text-gray-500 dark:text-gray-400">
                        {dataSetInfo && dataSetInfo.license_title}
                </p>


                <Citation dataSetInfo={dataSetInfo} lang={lang}/>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                </div>
            </DrawerItems>
        </Drawer>
        </>
    );
    
}
