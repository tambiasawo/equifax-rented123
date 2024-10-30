import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rented123 Credit Check",
  description: "Rented123 Credit Check, powered by Equifax",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
