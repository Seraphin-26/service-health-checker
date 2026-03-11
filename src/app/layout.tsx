import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Service Health Checker',
  description: 'Vérifiez la disponibilité de vos services en temps réel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
