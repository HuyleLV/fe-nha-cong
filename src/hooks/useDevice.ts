"use client";

import { useEffect, useState } from "react";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  windowWidth: number;
  windowHeight: number;
}

export const useDevice = (): DeviceInfo => {
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);

  const isTablet = windowWidth < 1024;
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    // Chỉ chạy bên client
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    windowWidth,
    windowHeight,
  };
};
