import { Inter } from "next/font/google";
import "./globals.css";
import Data from '@/utils/Data.json'
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";
import Sidebar from "@/components/sidebar/Sidebar";
import Navbar from "@/components/navbar/Navbar";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: Data.name,
  description: Data.description,
};
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <main className='grid lg:grid-cols-5'>
              {/* first-col hide on small-screen */}

              <div className='hidden lg:block lg:col-span-1 lg:min-h-screen'>
                <Sidebar />
              </div>
              {/* second-col hide dropdown on big-screen */}
              <div className='lg:col-span-4'>
                <Navbar />
                <div className='py-16 px-4 sm:px-8 lg:px-16'>{children}</div>
              </div>
            </main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
