import './globals.css';
import React from 'react';
import AuthProvider from '../components/AuthProvider';

export const metadata = {
  title: 'ViralSpy — High-Velocity Trend Prediction Terminal',
  description: 'Catch YouTube Shorts, Instagram Reels, and Reddit trends 48 hours before they peak.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-gray-100">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
