"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../components/header";
import Footer from "../components/footer";
import { ThemeProvider } from "next-themes";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/theme/themeConfig";

function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ConfigProvider theme={lightTheme}>
        {children}
      </ConfigProvider>
    );
  }

  const currentThemeConfig = (theme === "dark" || resolvedTheme === "dark") ? darkTheme : lightTheme;

  return (
    <ConfigProvider theme={currentThemeConfig}>
      {children}
    </ConfigProvider>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = !!pathname && pathname.startsWith("/admin");
  const isHostArea = !!pathname && pathname.startsWith("/quan-ly-chu-nha");
  const isPrintView = !!pathname && pathname.includes('/print-invoice');

  return (
    <AntdRegistry>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AntdConfigProvider>
          <>
            {/* Use a div wrapper to apply background color smoothly from theme */}
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              {!isAdmin && !isPrintView && <Header />}
              <main className="min-h-screen">{children}</main>
              {!isAdmin && !isHostArea && !isPrintView && <Footer />}
            </div>
          </>
        </AntdConfigProvider>
      </ThemeProvider>
    </AntdRegistry>
  );
}
