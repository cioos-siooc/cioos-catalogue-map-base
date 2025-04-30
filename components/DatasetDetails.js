
"use client";

import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { DrawerContext } from "../app/context/DrawerContext";
import Image from 'next/image';
import Citation from "@/components/Citation";
import {useContext} from "react";


export function DatasetDetails({ dataSetInfo, lang}) {

  const {isDrawerOpen, closeDrawer} = useContext(DrawerContext);
  console.log("DatasetDetails :: ", dataSetInfo);

    return (
        <>
        <Drawer open={isDrawerOpen} onClose={closeDrawer} position="right" backdrop={false}>
            <DrawerHeader titleIcon={() => <></>}/>
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
                    <h4 className="bg-gray-100 dark:bg-gray-900 text-sm font-bold mb-5">{dataSetInfo && dataSetInfo.title_translated[lang]}</h4>

                    <p className="bg-gray-100 dark:bg-gray-900 ">
                            {dataSetInfo && dataSetInfo.license_title}
                    </p>

                    <div className="text-justify mt-5 mb-5 bg-gray-100 dark:bg-gray-900 ">
                            {dataSetInfo && dataSetInfo.notes_translated[lang]}
                    </div>


                    <Citation dataSetInfo={dataSetInfo} lang={lang}/>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    </div>
                </DrawerItems>
        </Drawer>
        </>
    );
    
}
