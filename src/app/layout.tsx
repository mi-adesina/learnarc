import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "LearnArc", template: "%s | LearnArc" },
  description: "The smart learning platform for developers. Track progress, complete courses, and test your knowledge with interactive quizzes.",
  keywords: ["learning", "courses", "programming", "react", "javascript", "typescript"],
  authors: [{ name: "LearnArc" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "LearnArc",
    title: "LearnArc — Smart Learning Platform",
    description: "The smart learning platform for developers.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "LearnArc", description: "The smart learning platform for developers.", images: ["/og-image.png"] },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('learnarc-theme');if(t&&JSON.parse(t)?.state?.isDark===false)document.documentElement.classList.add('light');}catch(e){}` }} />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
