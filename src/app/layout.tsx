import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "PVRE.FILMS",
  description: "Photographer / Filmmaker Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-black`}>
        <Sidebar />
        <main className="pt-16 lg:pt-0 lg:ml-[280px] min-h-screen">{children}</main>
      </body>
    </html>
  );
}
