// context/DrawerContext.js
"use client";

import React, { createContext, useState, useContext } from "react";

export const DrawerContext = createContext({
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
  boundingBox: [
    [-90, -180],
    [90, 180],
  ],
  setBoundingBox: () => {},
});

export function DrawerProvider({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [boundingBox, setBoundingBox] = useState([
    [-90, -180],
    [90, 180],
  ]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const value = {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    boundingBox,
    setBoundingBox,
  };

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);
