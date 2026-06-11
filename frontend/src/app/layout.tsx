import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AIChatWidget from '../components/AIChatWidget';

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
        
        {/* PWA & Mobile Web App Meta Tags */}
        <meta name="theme-color" content="#050814" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('PWA ServiceWorker registered successfully: ', reg.scope);
              }, function(err) {
                console.log('PWA ServiceWorker registration failed: ', err);
              });
            });
          }
        `}} />
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
          
          {/* Global Floating AI Chat Widget */}
          <AIChatWidget />
          
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
