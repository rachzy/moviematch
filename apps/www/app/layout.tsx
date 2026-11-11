import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/features/auth/ui/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MovieMatch',
  description: 'Conecte-se com quem tem o mesmo gosto para filmes e séries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
