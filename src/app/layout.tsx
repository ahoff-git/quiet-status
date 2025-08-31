import type { Metadata } from "next";
import "./globals.css";

const APP_TITLE = "Quiet Status";
const APP_DESCRIPTION = "Stay informed without the noise";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
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
