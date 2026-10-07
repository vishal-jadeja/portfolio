import localFont from "next/font/local";
const blogSans = localFont({ src: "../../app/fonts/Hanken-Grotesk.woff2", variable: "--font-blog-sans", weight: "300 700", display: "swap" });
const blogSerif = localFont({ src: "../../app/fonts/Playfair-Display.woff2", variable: "--font-blog-serif", weight: "400 700", display: "swap" });
export default function BlogSurface({ children, className }: { children: React.ReactNode; className: string }) {
  return <div className={`${className} blog-theme ${blogSans.variable} ${blogSerif.variable}`}>{children}</div>;
}
