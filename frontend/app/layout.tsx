import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import GoogleProvider from "@/components/GoogleProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Speech Emotion Recognition",
  description: "AI-powered speech emotion recognition. Record or upload your voice and discover what your voice reveals about your emotional state.",
  keywords: ["voice analysis", "emotion recognition", "speech AI", "deep learning", "audio analysis"],
  openGraph: {
    title: "Speech Emotion Recognition",
    description: "AI-powered speech emotion recognition.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('ser_theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');})();`,
          }}
        />
      </head>
      <body>
        <GoogleProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
