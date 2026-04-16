"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/" || pathname === "/admission";

  if (isAuthPage) {
    return (
      <html lang="en">
        <body>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden bg-gray-100">
          <Sidebar />
          <div className="flex flex-col flex-1">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
              <Toaster position="top-right" />
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}