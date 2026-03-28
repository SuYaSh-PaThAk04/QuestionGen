import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QPGen — Question Paper Generator",
  description: "CO-based automated question paper generation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen relative overflow-x-hidden">
        {/* Ambient orbs */}
        <div className="orb w-[600px] h-[600px] top-[-200px] left-[-200px]" style={{ background: "rgba(232,197,71,0.3)" }} />
        <div className="orb w-[500px] h-[500px] bottom-[-100px] right-[-150px]" style={{ background: "rgba(76,201,240,0.2)", animationDelay: "3s" }} />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
