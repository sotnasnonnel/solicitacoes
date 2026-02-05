import "./globals.css";
import { AppShell } from "@/app/components/AppShell";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className={inter.className} style={{ margin: 0 }}>
        <AppShell>{children}</AppShell>
        
      </body>
    </html>
  );
}
