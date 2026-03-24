import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import Providers from "../components/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>

        <Providers>

          <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">

            <Sidebar />

            <div className="flex flex-col flex-1">

              <Navbar />

              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>

            </div>

          </div>

        </Providers>

      </body>
    </html>
  );
}
