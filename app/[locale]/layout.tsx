import '../globals.css';
import React from 'react';
import AuthProvider from '../../components/AuthProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import CustomCursor from '../../components/CustomCursor';

export const metadata = {
  title: "ViralSpy — Catch trends 48hrs early",
  description: "AI-powered trend detection for content creators",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" }
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className="antialiased bg-[#F7F5F2] text-[#1A1A1A]">
        <CustomCursor />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
