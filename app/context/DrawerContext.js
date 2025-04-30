// context/DrawerContext.js
"use client";

import { createContext, useContext, useState } from "react";

export const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dataSetInfo, setDatasetInfo] = useState(null);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <DrawerContext.Provider value={{ isDrawerOpen,  openDrawer, closeDrawer , dataSetInfo, setDatasetInfo }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => useContext(DrawerContext);

export const MyConsumerComponent = () => {
    return (
      <DrawerContext.Consumer>
        {isDrawerOpen}
      </DrawerContext.Consumer>
    );
  };




