"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface LayoutContextType {
  leftContent: ReactNode;
  rightContent: ReactNode;
  children: ReactNode;
}

export const LayoutContext = createContext<LayoutContextType>({
  leftContent: null,
  rightContent: null,
  children: null,
});

export const LayoutContextProvider: React.FC<LayoutContextType> = ({
  children,
  leftContent,
  rightContent,
}) => {
  return (
    <LayoutContext.Provider value={{ leftContent, rightContent, children }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => useContext(LayoutContext);
