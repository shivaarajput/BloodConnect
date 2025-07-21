import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/context/UserContext';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'BloodConnect - Find & Donate Blood',
  description: 'Join BloodConnect to find compatible blood donors and recipients in your area. Register in minutes, save lives, and make a difference in your community.',
  openGraph: {
    title: 'BloodConnect - Connect, Donate, Save Lives',
    description: 'A seamless platform bridging the gap between blood donors and recipients. Find or become a lifesaver today.',
    url: 'https://bloodconnect-ssr.vercel.app/',
    siteName: 'BloodConnect',
    images: [
      {
        url: 'https://bloodconnect-ssr.vercel.app/preview.png',
        width: 1200,
        height: 630,
        alt: 'A preview image of the BloodConnect application showing user cards.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BloodConnect - Connect, Donate, Save Lives',
    description: 'A seamless platform bridging the gap between blood donors and recipients. Find or become a lifesaver today.',
    images: ['https://bloodconnect-ssr.vercel.app/preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UserProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
              </div>
              <Toaster />
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
