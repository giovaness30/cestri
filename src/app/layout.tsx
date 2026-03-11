import type { Metadata } from "next";
import "./styles/main.scss";
import { Providers } from "@/providers";

export const metadata: Metadata = {
  title: "CESTRI - Sua cesta inteligente",
  description: "CESTRI - Sua cesta - agora Inteligente! Descubra o poder da IA para otimizar suas compras, economizar tempo e dinheiro. Com a CESTRI, sua cesta de compras se torna inteligente, sugerindo produtos, comparando preços e garantindo a melhor experiência de compra online. Simplifique suas compras com a CESTRI - onde a inteligência encontra a conveniência!",
  // viewport: {
  //   width: "device-width",
  //   initialScale: 1,
  //   maximumScale: 1,
  //   userScalable: false,
  // },
};

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
