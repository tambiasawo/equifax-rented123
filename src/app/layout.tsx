import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credit Check | Rented123",
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
