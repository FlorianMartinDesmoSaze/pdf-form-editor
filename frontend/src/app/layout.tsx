import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pdf-form-editor-b7z8.onrender.com"),
  title: "Fill & Sign PDF Online — Private, Free & No Upload | PDF Editor Studio",
  description: "Fill in PDF forms, add text, dates, checkboxes and signatures online. Your document stays in your browser: no account, no upload and no watermark.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  verification: { google: "yBpn3aGWo1_bEaHbwqpqUOtX6x7O2X26hbLsXtBLFyw" },
  openGraph: {
    title: "Fill & Sign PDF Online — Private & Free",
    description: "Fill, sign and download PDFs directly in your browser. No account or upload required.",
    url: "/",
    siteName: "PDF Editor Studio",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PDF Editor Studio',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    description: 'A private browser-based tool to fill and sign PDF documents.',
    url: 'https://pdf-form-editor-b7z8.onrender.com/',
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
