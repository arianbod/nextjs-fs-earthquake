import { Inter } from "next/font/google";
import "./globals.css";
import Data from '@/utils/Data.json'
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";
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

            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
