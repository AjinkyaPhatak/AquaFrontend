import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaSense | Lake Frothing Forecasting",
  description: "Forecast lake frothing from satellite imagery with time-to-froth estimates, risk staging, and operational reports.",
  keywords: ["lake frothing", "satellite imagery", "froth detection", "remote sensing", "lake monitoring"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
