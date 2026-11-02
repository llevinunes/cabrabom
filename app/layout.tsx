import type { Metadata, Viewport } from "next";
import { archivo } from "./fontes";
import "./globals.css";

export const metadata: Metadata = {
  title: "CabraBom",
  description: "Mão de obra de confiança, perto de você.",
};

export const viewport: Viewport = {
  themeColor: "#14233C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <div className="mx-auto w-full max-w-[390px] px-6 pt-6 pb-8">{children}</div>
      </body>
    </html>
  );
}
