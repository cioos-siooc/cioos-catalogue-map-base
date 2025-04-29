// context/DrawerContext.js
"use client";

import { createContext, useContext, useState } from "react";

const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <DrawerContext.Provider value={{ isDrawerOpen, openDrawer, closeDrawer }}>
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




