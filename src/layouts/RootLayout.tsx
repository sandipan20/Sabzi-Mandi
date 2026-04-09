import { type ReactElement } from 'react';

import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <LanguageProvider>
      <CartProvider>
        <Website>
          <Header />
          {children}
          <Footer />
        </Website>
      </CartProvider>
    </LanguageProvider>
  );
}
