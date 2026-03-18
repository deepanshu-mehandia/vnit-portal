import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import { ThemeProvider } from "next-themes"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex bg-gray-100">

        <Sidebar />

		<div className="bg-gray-900 text-white p-4 flex justify-between">
  			<span className="font-bold">VNIT Portal</span>
  			<span>Admin</span>
		</div>

        <div className="flex-1">

          <Navbar />

          <main className="p-6">
            <ThemeProvider attribute="class">
  		{children}
	    </ThemeProvider>
          </main>

        </div>

      </body>
    </html>
  );
}
