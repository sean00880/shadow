"use client";

import React from "react";
import { useLayoutContext } from "./LayoutContext";

const ConnectSubLayout: React.FC = () => {
  const { leftContent, rightContent } = useLayoutContext();

  return (
    <div className="auth flex flex-col md:flex-row min-h-screen">
      {/* Left Scrollable Section */}
      <div className="w-full md:w-1/2 overflow-auto p-4">{leftContent}</div>

      {/* Right Fixed Section */}
      <div className="w-full md:w-1/2 flex justify-center items-start">
        <div className="sticky top-20 p-6 w-full">{rightContent}</div>
      </div>
    </div>
  );
};

export default ConnectSubLayout;
