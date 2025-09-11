import type { Metadata } from "next";
import { Playfair_Display, Open_Sans } from "next/font/google";
import "./globals.scss";

const playfairSerif = Playfair_Display({
  variable: "--font-playfair-serif",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Анна Светлова - Фотограф",
  description: "Анна Светлова - Фотограф",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${playfairSerif.variable} ${openSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
