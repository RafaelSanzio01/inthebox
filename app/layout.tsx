// src/app/layout.tsx (or app/layout.tsx)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// IMPORT COMPONENTS:
// Using '../' because 'components' folder is outside 'app' folder (sibling)
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Providers from "../components/Providers";
import { ToastProvider } from "../components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "intheBox", // Changed title
  description: "Social platform for movie lovers.", // Changed description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ADDED CLASSES:
        - bg-black: Sets dark background
        - text-white: Sets white text globally
        - min-h-screen flex flex-col: Makes sure footer stays at the bottom
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen flex flex-col`}
      >
        {/* WRAP EVERYTHING WITH PROVIDERS for Auth */}
        <Providers>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}