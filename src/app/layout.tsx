import type { Metadata } from "next";
import { Inter } from "next/font/google";
<<<<<<< HEAD
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({
=======
import { AuthProvider } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
>>>>>>> 816cf2c (fix: resolve build errors for Vercel deployment)
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StrokeLab - Golf Statistics Dashboard",
  description: "Track, analyze, and improve your golf game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
<<<<<<< HEAD
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
=======
        className={`${inter.variable} antialiased min-h-screen bg-background text-foreground`}
>>>>>>> 816cf2c (fix: resolve build errors for Vercel deployment)
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
