import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Theme } from "@astryxdesign/core";
import { Geist, Geist_Mono } from "next/font/google";
import { appTheme, appThemeMode } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ePersona",
  description: "AI persona chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ height: "100%", margin: 0 }}
      >
        <ClerkProvider>
          <Theme theme={appTheme} mode={appThemeMode}>
            {children}
          </Theme>
        </ClerkProvider>
      </body>
    </html>
  );
}
