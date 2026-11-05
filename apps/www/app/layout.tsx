import './globals.css';

export const metadata = {
  title: 'MovieMatch',
  description: 'Conecte-se com quem tem o mesmo gosto para filmes e séries.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
