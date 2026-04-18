import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ExitIntentPopup } from "@/components/ui/ExitIntentPopup";
import { ServicesSidebar } from "@/components/ui/ServicesSidebar";
import { BeforeChinaBanner } from "@/components/ui/BeforeChinaBanner";
import { IQTestBanner } from "@/components/ui/IQTestBanner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL("https://chinaunimatch.com"),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Chinese universities",
    "study in China",
    "CSC scholarship",
    "China scholarship",
    "international students China",
    "university application China",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <LanguageProvider>
          <CurrencyProvider>
            <ThemeProvider>
              <IQTestBanner />
              <Navbar />
              <main>{children}</main>
              <Footer />
              <WhatsAppFloat />
              <ExitIntentPopup />
              <ServicesSidebar />
              <BeforeChinaBanner />
            </ThemeProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
