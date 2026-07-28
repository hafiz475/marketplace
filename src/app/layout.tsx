import type { Metadata } from "next";
import { Outfit, Bebas_Neue, Caveat } from "next/font/google";
import { CartProvider } from "@/lib/CartContext";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "CirclTrade - Public Catalog",
  description: "Browse products and services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${bebasNeue.variable} ${caveat.variable}`}
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
