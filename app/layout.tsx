import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "OKEGANHA",
  description: "Ganhe dinheiro com tarefas reais no seu bairro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className="antialiased"
        style={
          {
            "--font-manrope":
              '"Manrope", "Sora", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            "--font-sora":
              '"Sora", "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
