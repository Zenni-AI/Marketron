import type { Metadata, Viewport } from "next";
import "./globals.css";

// Update to the production domain once DNS is pointed at the deployment —
// this is what Next resolves relative Open Graph URLs against.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jvspainting.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "JVS Painting Inc. | Government, Municipal & Commercial Painting Contractors in New Jersey",
    template: "%s | JVS Painting Inc.",
  },
  description:
    "JVS Painting Inc. is a New Jersey painting contractor with over 40 years of experience on government, municipal and commercial work — military installations, municipal buildings, schools, warehouses, offices and multi-family properties. Licensed, bonded, insured and E-Verify participating. Request a bid.",
  keywords: [
    "commercial painting contractor New Jersey",
    "government contract painting",
    "municipal painting contractor NJ",
    "school district painting contractor",
    "public works painting contractor",
    "military base painting contractor",
    "Davis-Bacon prevailing wage painting",
    "industrial painting NJ",
    "warehouse painting contractor",
    "property management painting services",
    "Riverside NJ painting company",
  ],
  applicationName: "JVS Painting Inc.",
  authors: [{ name: "JVS Painting Inc." }],
  creator: "JVS Painting Inc.",
  publisher: "JVS Painting Inc.",
  category: "Construction & Painting Contractors",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "JVS Painting Inc.",
    title:
      "JVS Painting Inc. | Government, Municipal & Commercial Painting Contractors in New Jersey",
    description:
      "40+ years of government, municipal and commercial painting across New Jersey — from military installations to municipal buildings and major commercial facilities. Licensed, bonded, insured, E-Verify participating. Submit a bid request.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JVS Painting Inc. | Government, Municipal & Commercial Painting Contractors",
    description:
      "40+ years of dependable, code-compliant painting for government installations, municipal facilities and commercial properties across New Jersey.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#1F295D",
  width: "device-width",
  initialScale: 1,
};

// Local-business structured data — helps the contractor show up for the
// "painting contractor near me" style searches this audience actually uses.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: "JVS Painting Inc.",
  description:
    "Government, municipal and commercial painting contractor serving New Jersey for over 40 years.",
  url: siteUrl,
  telephone: "+1-856-461-5888",
  address: {
    "@type": "PostalAddress",
    streetAddress: "104 4th Street, Unit A",
    addressLocality: "Riverside",
    addressRegion: "NJ",
    postalCode: "08075",
    addressCountry: "US",
  },
  areaServed: { "@type": "State", name: "New Jersey" },
  knowsAbout: [
    "Government contract painting",
    "Municipal and public works painting",
    "School and district facility painting",
    "Commercial painting",
    "Industrial painting",
    "Prevailing wage / Davis-Bacon projects",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        Typography is system-stack only (Georgia display / Arial UI), so there is
        no webfont round-trip and no font-swap layout shift.
      */}
      <body className="bg-offWhite font-sans text-steel antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
      </body>
    </html>
  );
}
