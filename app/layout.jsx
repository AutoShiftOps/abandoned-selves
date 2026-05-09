import './globals.css'
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata = {
  title: 'Almost Became — Museum of Your Abandoned Selves',
  description: "A museum for the lives you almost lived. Tell us who you almost became — and we'll build the exhibit.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://almostbecame.com'),
  openGraph: {
    title: 'Almost Became',
    description: "A museum for the lives you almost lived.",
    url: 'https://almostbecame.com',
    siteName: 'Almost Became',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Almost Became' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Almost Became — Museum of Your Abandoned Selves',
    description: "A museum for the lives you almost lived.",
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        {/* Google Analytics 4 — free, no paid plan needed */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
