import { Inter } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import Data from '@/utils/Data.json'
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";
import AssistantWrapper from "@/components/assistant/AssistantWrapper";
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
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`
                    ${geistSans.variable} 
                    ${geistMono.variable} 
                    antialiased 
                    min-h-screen 
                    flex 
                    flex-col 
                    dark:bg-[#1B224C]
                    dark:text-white
                `}>
          <Providers>

            <AssistantWrapper />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
