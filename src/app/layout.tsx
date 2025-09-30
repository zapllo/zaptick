import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import WAProviderGate from "./WAProviderGate"; // 

const outfit = Outfit({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zaptick",
  description:
    "Zaptick transforms WhatsApp into a powerful platform for customer engagement, support, and commerce with enterprise-grade automation.",
  openGraph: {
    title: "Zaptick - Transform your WhatsApp into Revenue",
    description:
      "Zaptick transforms WhatsApp into a powerful platform for customer engagement, support, and commerce with enterprise-grade automation",
    url: "https://zaptick.io",
    type: "website",
    images: [
      {
        url: "https://zaptick.io/og.png",
        width: 1200,
        height: 630,
        alt: "Image for Zaptick - Transform your WhatsApp into Revenue 🚀 ",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable}`} style={{ colorScheme: "light" }}>
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
          async
        />
        <meta name="color-scheme" content="light" />
      </head>
      <body className={`${outfit.className} antialiased`} style={{ colorScheme: "light" }}>
        <div id="fb-root"></div>
        <Toaster />

        {/* Auth must wrap the gate so the gate can read user.id */}
        <AuthProvider>
          <WAProviderGate>
            {children}
          </WAProviderGate>
        </AuthProvider>

        {/* Facebook SDK Script */}
        <Script id="facebook-sdk" strategy="afterInteractive">
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId            : '${process.env.NEXT_PUBLIC_META_APP_ID}',
                autoLogAppEvents : true,
                xfbml            : true,
                version          : 'v19.0'
              });
            };
          `}
        </Script>
        <Script
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
