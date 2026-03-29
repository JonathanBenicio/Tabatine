import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Omie Connect',
  description: 'Integração de Notas Fiscais e Clientes com Omie ERP',
};

// Script otimizado para evitar FOUC (Flash of Unstyled Content)
// Precisa ser uma IIFE em string pura pois roda antes do React hidratar
const ThemeScript = () => {
  const scriptContent = `
    (function() {
      try {
        const storage = JSON.parse(localStorage.getItem('theme-storage') || '{}');
        const theme = storage?.state?.theme || 'system';
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
