import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La CLEF System",
  description: "La CLEF System Dashboard",
};

export default function RootLayout({ children,}: Readonly<{children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <body className="antialiased overflow-y-scroll">
        {children}
      </body>
    </html>
  );
}
