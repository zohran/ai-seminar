import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Seminar - Question Management",
  description: "Manage and track questions with urgency levels",
};

/**
 * Root layout for the application that sets global fonts, language, and theme provider.
 *
 * Renders the HTML document root with lang="en" and suppresses hydration warnings. Applies
 * Geist Sans and Geist Mono font CSS variables and the `antialiased` body class, then wraps
 * the page content in the ThemeProvider configured to use the system theme and class-based theming.
 *
 * @param children - The page content to render inside the themed layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
