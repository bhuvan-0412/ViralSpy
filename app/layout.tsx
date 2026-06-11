import './globals.css';
import React from 'react';
import AuthProvider from '../components/AuthProvider';

export const metadata = {
  title: "ViralSpy — Catch trends 48hrs early",
  description: "AI-powered trend detection for content creators",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F7F5F2] text-[#1A1A1A]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
