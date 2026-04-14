import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthPage =
    typeof window !== "undefined" &&
    (window.location.pathname === "/" ||
      window.location.pathname === "/admission");

  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}