import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import config from "./config.js";
import { DrawerProvider } from "./context/DrawerContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = config.metadata.fr;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
        <DrawerProvider>
          {children}
        </DrawerProvider>
      </body>
    </html>
  );
}
