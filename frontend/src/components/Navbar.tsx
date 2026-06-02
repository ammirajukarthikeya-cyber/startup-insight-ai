'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-slate-950/65 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white transition hover:opacity-90">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#nav-logo-grad)" />
            <path d="M16 7L24 15H19V25H13V15H8L16 7Z" fill="white" />
            <circle cx="16" cy="16" r="3" fill="#00f0ff" />
            <defs>
              <linearGradient id="nav-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
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

        {/* User CTA Action buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-slate-400 sm:inline-block">
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
      </div>
    </header>
  );
}
