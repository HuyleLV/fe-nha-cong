import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientLayout from "@/components/layoutClient";
import FloatingChatButtons from "@/components/FloatingChatButtons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
          <FloatingChatButtons />
        </ClientLayout>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Nhà Cộng",
  description: "Nền tảng thuê phòng trọ, căn hộ dịch vụ",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};
