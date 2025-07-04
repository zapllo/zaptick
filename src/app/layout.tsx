import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  variable: "--font-roboto",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  weight: ['400', '500'],
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zaptick",
  description: "Zaptick transforms WhatsApp into a powerful platform for customer engagement, support, and commerce with enterprise-grade automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive" // Ensures the script loads before your app's JavaScript
          async
        />
      </head>
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased`}
      >
        <div id="fb-root"></div>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Toaster />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>

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
