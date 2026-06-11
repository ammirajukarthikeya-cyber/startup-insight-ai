'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-slate-950/65 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2 text-xl font-bold tracking-tight text-white transition hover:opacity-90">
          <img src="/icon.png" alt="Startup Insight AI Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span>
            Startup Insight <span className="text-cyan-400">AI</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex">
          <Link href="/analyzer" className="transition hover:text-white">Idea Analyzer</Link>
          <Link href="/events" className="transition hover:text-white">Events Hub</Link>
          <Link href="/news" className="transition hover:text-white">Tech Updates</Link>
          <Link href="/mentor" className="transition hover:text-white">AI Mentor</Link>
          {user && (
            <>
              <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-purple-400 transition hover:text-purple-300">Admin Panel</Link>
              )}
            </>
          )}
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
        </nav>

        {/* Desktop Action Buttons / Mobile Hamburger */}
        <div className="flex items-center gap-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">
                  Logged in: <strong className="text-slate-200">{user.email}</strong>
                </span>
                <button 
                  onClick={logout}
                  className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login"
                  className="text-xs font-semibold text-slate-400 transition hover:text-white"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-purple-500 hover:to-blue-500"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white md:hidden"
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isOpen && (
        <div className="border-t border-white/5 bg-slate-950/95 py-4 px-6 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-400">
            <Link href="/analyzer" onClick={closeMenu} className="transition hover:text-white py-1">Idea Analyzer</Link>
            <Link href="/events" onClick={closeMenu} className="transition hover:text-white py-1">Events Hub</Link>
            <Link href="/news" onClick={closeMenu} className="transition hover:text-white py-1">Tech Updates</Link>
            <Link href="/mentor" onClick={closeMenu} className="transition hover:text-white py-1">AI Mentor</Link>
            {user && (
              <>
                <Link href="/dashboard" onClick={closeMenu} className="transition hover:text-white py-1">Dashboard</Link>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={closeMenu} className="text-purple-400 transition hover:text-purple-300 py-1">Admin Panel</Link>
                )}
              </>
            )}
            <Link href="/pricing" onClick={closeMenu} className="transition hover:text-white py-1">Pricing</Link>
            
            <div className="border-t border-white/5 my-2 pt-4 flex flex-col gap-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400">
                    Logged in: <strong className="text-slate-200">{user.email}</strong>
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link 
                    href="/login"
                    onClick={closeMenu}
                    className="flex h-10 items-center justify-center rounded-lg border border-white/5 text-xs font-semibold text-slate-300 transition hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register"
                    onClick={closeMenu}
                    className="flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-xs font-semibold text-white shadow-md transition hover:from-purple-500 hover:to-blue-500"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
