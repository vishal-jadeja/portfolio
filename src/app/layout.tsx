import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import { PERSON, SITE_NAME, SITE_URL, pageRobots } from "@/lib/seo";
import "./globals.css";

const dmSans = localFont({
  src: "./fonts/DM-Sans.woff2",
  variable: "--font-dm-sans",
  weight: "400 700",
  display: "swap",
});

const playfairDisplay = localFont({
  src: "./fonts/Playfair-Display.woff2",
  variable: "--font-playfair",
  weight: "700 800",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrains-Mono.woff2",
  variable: "--font-jetbrains-mono",
  weight: "400 500",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  title: {
    default: PERSON.headline,
    template: `%s · ${SITE_NAME}`,
  },
  description: PERSON.description,
  applicationName: `${SITE_NAME} Portfolio`,
  authors: [{ name: PERSON.name, url: SITE_URL }],
  creator: PERSON.name,
  publisher: PERSON.name,
  category: "technology",
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  // Public pages opt in with their own metadata. Unknown/private routes must
  // not inherit homepage indexing directives or its canonical/social URL.
  robots: pageRobots(false, false),
};

// No `colorScheme` here on purpose: the theme is driven by the `.dark` class
// from localStorage, which can disagree with the OS preference. Declaring
// color-scheme would make native controls follow the OS and mismatch the page.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Dark is the default and is server-rendered, so it survives React
    // client-rendering <html> after a hydration error. Only an explicit
    // "light" choice removes it.
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Anti-flicker: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
