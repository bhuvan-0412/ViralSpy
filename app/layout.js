import "./globals.css";

export const metadata = {
  title: "ViralSpy — Predictive Trend SaaS for Content Creators",
  description: "Detect TikTok, YouTube, and Instagram trends 48 hours before they peak, and generate high-impact ready-to-film content briefs.",
  metadataBase: new URL("https://viralspy.io"),
  openGraph: {
    title: "ViralSpy — Predictive Trend SaaS",
    description: "Detect trends 48 hours before they peak, and get instant ready-to-film content briefs.",
    type: "website",
    locale: "en_US",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-[#F4F2ED]/35 selection:text-[#F4F2ED]">
        {children}
      </body>
    </html>
  );
}
