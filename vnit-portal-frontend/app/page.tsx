"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import Providers from "../components/providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage = pathname === "/";

  return (
    <html lang="en">
      <body>
        <Providers>

          {isAuthPage ? (
            children
          ) : (
            <div className="flex h-screen overflow-hidden bg-gray-100">

              <Sidebar />

              <div className="flex flex-col flex-1">
                <Navbar />

                <main className="flex-1 overflow-y-auto p-6">
                  {children}
                </main>
              </div>

            </div>
          )}

        </Providers>
      </body>
    </html>
  );
}