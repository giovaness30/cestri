import type { Metadata } from "next";
import "./styles/main.scss";
import { Providers } from "@/providers";

export const metadata: Metadata = {
  title: "Cestri - Sua cesta inteligente",
  description: "Cestri - Sua cesta - agora Inteligente! Descubra o poder da IA para otimizar suas compras, economizar tempo e dinheiro. Com a Cestri, sua cesta de compras se torna inteligente, sugerindo produtos, comparando preços e garantindo a melhor experiência de compra. Simplifique suas compras com a Cestri - onde a inteligência encontra a conveniência!"
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="container-children">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
