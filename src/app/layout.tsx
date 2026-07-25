import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "7 Ouro Tabacaria | Premium Store",
  description: "O melhor catálogo de produtos de tabacaria com entrega rápida.",
};

import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import AgeVerification from "@/components/AgeVerification";
import CookieConsent from "@/components/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={outfit.variable}>
        <CartProvider>
          <AgeVerification />
          <Navbar />
          {children}
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
