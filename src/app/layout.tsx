import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import LayoutWrapper from '@/components/LayoutWrapper';
import 'react-phone-input-2/lib/style.css';
import { Toaster } from 'sonner';
export const metadata: Metadata = {
  title: 'PROSERVE ERP',
  description: 'Enterprise Resource Planning Application',
  icons: {
    icon: '/loading.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Toaster richColors position="top-right" duration={3000} closeButton />
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
