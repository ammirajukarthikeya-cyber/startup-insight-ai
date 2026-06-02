'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, verifyEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(email, password);
      setPendingVerification(true);
      setSuccess('Account created! A 6-digit verification code has been generated. Check developer terminal logs.');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmail(email, otpCode);
      setSuccess('Email successfully verified! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid verification OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white">
            {pendingVerification ? 'Verify Your Email' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {pendingVerification 
              ? 'Complete validation setup to activate your dashboard' 
              : 'Register to validate startup ideas and unlock VC opportunities'
            }
          </p>
        </div>

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

        {!pendingVerification ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                id="email"
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Secure Password</label>
              <input 
                id="password"
                type="password" 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3.5 text-xs font-bold text-white shadow-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Submitting Details...' : 'Create Account'}
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4">
              Already have an account? <Link href="/login" className="text-cyan-400 font-bold hover:underline">Log in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-5">
            <div>
              <label htmlFor="otpCode" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">6-Digit Verification Code</label>
              <input 
                id="otpCode"
                type="text" 
                placeholder="e.g. 123456" 
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200 tracking-[0.2em] text-center font-mono text-lg"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3.5 text-xs font-bold text-white shadow-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
            </button>

            <button 
              type="button" 
              onClick={() => setPendingVerification(false)}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-white transition"
            >
              ← Back to sign-up
            </button>
          </form>
        )}
        
      </div>
    </div>
  );
}
