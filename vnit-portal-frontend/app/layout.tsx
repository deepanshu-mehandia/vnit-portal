import Sidebar from "../components/sidebar"
import Navbar from "../components/navbar"
import { ThemeProvider } from "next-themes"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

          <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">

            {/* Sidebar */}
            <Sidebar />

            {/* Right side */}
            <div className="flex flex-col flex-1">

              {/* Top Navbar */}
              <Navbar />

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>

            </div>

          </div>

        </ThemeProvider>

      </body>
    </html>
  )
}
