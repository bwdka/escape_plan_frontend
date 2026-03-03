import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

declare global {
  interface Window {
    snap: any;
  }
}

export const metadata: Metadata = {
  title: "Escape Plan - Best Glamping Experiences",
  description: "Discover and book unique glamping experiences.",
};

export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html lang="en">

      <body className={inter.className} suppressHydrationWarning>

        <Providers>

          {children}

          <Toaster position="top-center" />

        </Providers>
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      </body>

    </html>

  );

}
