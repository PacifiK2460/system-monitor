import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

import { SimulationProvider } from '@/app/simulationContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SimulationProvider>
            <SidebarProvider>
              <AppSidebar />
              <Toaster />
              <main className="w-screen h-screen backdrop-blur-3xl dark:bg-black/60 bg-white/30">
                <SidebarTrigger className="text-white" />
                {children}
              </main>
            </SidebarProvider>
          </SimulationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
