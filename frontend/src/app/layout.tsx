import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Startup Insight AI - Validate, Analyze & Scale Your Startup',
  description: 'Validate startup ideas, map competitor ecosystems, predict compliance vulnerabilities, discover sponsors and investors, and consult our AI Startup Mentor.',
  keywords: 'startup validation, AI business mentor, competitor intelligence, risk scanner, pitch validation, venture capital matching',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="dark-theme antialiased bg-[#050814] text-slate-100 min-h-screen flex flex-col">
        <AuthProvider>
          {/* Aesthetic backgrounds */}
          <div className="grid-background" />
          <div className="glowing-orb-1" />
          <div className="glowing-orb-2" />
          
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          
          <footer className="w-full py-8 border-t border-white/5 bg-slate-950/40 text-center text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p>© 2026 Startup Insight AI. Developed for modern entrepreneurs.</p>
              <div className="flex gap-6">
                <a href="#analyzer" className="hover:text-white transition">Privacy Policy</a>
                <a href="#pricing" className="hover:text-white transition">Terms of Service</a>
                <a href="mailto:support@startupinsight.ai" className="hover:text-white transition">Support Help</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
