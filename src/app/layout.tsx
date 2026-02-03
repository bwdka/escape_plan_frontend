import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

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

      </body>

    </html>

  );

}
