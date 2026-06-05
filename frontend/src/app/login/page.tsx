'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login, verifyMfa } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.isMfaRequired) {
        setMfaRequired(true);
        setMfaToken(res.token || '');
        setSuccess('MFA verification challenge code sent to your registered email address.');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyMfa(email, mfaCode);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid MFA verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Form header title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white">
            {mfaRequired ? 'Multi-Factor Verification' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {mfaRequired 
              ? 'Enter the security challenge code. (For sandbox testing, use master code 123456)' 
              : 'Sign in to access your Startup validation console'
            }
          </p>
        </div>

        {/* Display feedback alerts */}
        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3 text-xs text-cyan-400 leading-relaxed font-semibold">
            {success}
          </div>
        )}

        {/* Dynamic form render */}
        {!mfaRequired ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                id="email"
                type="email" 
                placeholder="demo@startupinsight.ai" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200"
                suppressHydrationWarning
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xxs text-cyan-400 hover:underline">Forgot password?</Link>
              </div>
              <input 
                id="password"
                type="password" 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200"
                suppressHydrationWarning
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3.5 text-xs font-bold text-white shadow-lg transition duration-200 disabled:opacity-50"
              suppressHydrationWarning
            >
              {loading ? 'Authenticating...' : 'Sign In To Platform'}
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4">
              Don&apos;t have an account? <Link href="/register" className="text-cyan-400 font-bold hover:underline">Register now</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-5">
            <div>
              <label htmlFor="mfaCode" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enter Verification Code</label>
              <input 
                id="mfaCode"
                type="text" 
                placeholder="e.g. 123456" 
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200 tracking-[0.2em] text-center font-mono text-lg"
                suppressHydrationWarning
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3.5 text-xs font-bold text-white shadow-lg transition duration-200 disabled:opacity-50"
              suppressHydrationWarning
            >
              {loading ? 'Verifying Challenge...' : 'Submit Verification Code'}
            </button>

            <button 
              type="button" 
              onClick={() => setMfaRequired(false)}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-white transition"
              suppressHydrationWarning
            >
              ← Back to password sign-in
            </button>
          </form>
        )}
        
      </div>
    </div>
  );
}
