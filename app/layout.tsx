import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FATBOY Feedback",
  description: "Tu opinión nos ayuda a mejorar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#f1f5f9] antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200 via-slate-200 to-zinc-100">
        {children}
      </body>
    </html>
  );
}
