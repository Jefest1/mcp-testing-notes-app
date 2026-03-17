import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Purple Notes',
  description: 'A simple purple-themed notes app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gradient-to-br from-purple-950 via-slate-950 to-purple-900 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
