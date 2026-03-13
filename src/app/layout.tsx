import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoneyWise — Personal Finance',
  description: 'Your personal finance management dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
