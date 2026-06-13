import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI agents",
    "agent-friendly commerce",
    "agent API",
    "digital products",
    "AI prompts",
    "templates",
    "workflow helpers",
    "JSON catalog",
    "llms.txt",
  ],
  category: "technology",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: defaultTitle,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    types: {
      // Curated site map for LLMs and autonomous agents (llmstxt.org).
      "text/plain": "/llms.txt",
      "application/agent-commerce+json": "/.well-known/agent-commerce.json",
      "application/openapi+json": "/openapi.json",
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": absoluteUrl("/#organization"),
  name: SITE_NAME,
  url: SITE_URL,
  slogan: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { "@id": absoluteUrl("/#organization") },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
