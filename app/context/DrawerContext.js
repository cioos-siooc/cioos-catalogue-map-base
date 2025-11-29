// context/DrawerContext.js
"use client";

import { createContext, useContext, useState } from "react";

export const DrawerContext = createContext({
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
});

export function DrawerProvider({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const value = { isDrawerOpen, openDrawer, closeDrawer, toggleDrawer };

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);
