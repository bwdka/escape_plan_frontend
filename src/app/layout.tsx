import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import Script from "next/script";
import AiChatWidget from "@/components/ai/AiChatWidget";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
declare global {
  interface Window {
    snap: any;
  }
}

export const metadata: Metadata = {
  title: "Escape Plan - Best Glamping Experiences",
  description: "Discover and book unique glamping experiences.",
  icons: {
    icon: "/logo/logo_only_escape_plan.png",
  },
};

export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html lang="en">

      <body className={`${manrope.variable} ${fraunces.variable} font-body`} suppressHydrationWarning>

        <Providers>

          {children}

          <AiChatWidget />

          <Toaster position="top-center" />

        </Providers>
        <Script
          src="https://app.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
          strategy="afterInteractive"
        />      </body>

    </html>

  );

}
