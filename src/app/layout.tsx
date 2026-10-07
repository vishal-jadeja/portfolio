import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import { PERSON, SITE_NAME, SITE_URL, X_HANDLE, pageRobots } from "@/lib/seo";
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
  keywords: [
    "Vishal Jadeja",
    "Software Developer",
    "Software Engineer",
    "Backend Engineer",
    "Scalable Systems",
    "MERN Stack",
    "Node.js",
    "TypeScript",
  ],
  applicationName: `${SITE_NAME} Portfolio`,
  authors: [{ name: PERSON.name, url: SITE_URL }],
  creator: PERSON.name,
  publisher: PERSON.name,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: PERSON.headline,
    description: PERSON.shortDescription,
    url: SITE_URL,
    siteName: `${SITE_NAME} Portfolio`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: PERSON.headline,
    description: PERSON.shortDescription,
    ...(X_HANDLE ? { site: X_HANDLE, creator: X_HANDLE } : {}),
  },
  robots: pageRobots(),
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flicker: apply theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('theme');if(!saved){saved=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';localStorage.setItem('theme',saved);}var d=document.documentElement;if(saved==='dark'){d.classList.add('dark');}else{d.classList.remove('dark');}}catch(e){}})();`,
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
