'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pendingReset, setPendingReset] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password-request', { email });
      setPendingReset(true);
      if (res && res.otp_code) {
        setSuccess(`Reset OTP code: ${res.otp_code} (also sent to your email). Please enter it below along with your new password.`);
      } else {
        setSuccess('If the account exists, a 6-digit password reset OTP code has been sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password-confirm', {
        email,
        otp_code: otpCode,
        new_password: newPassword,
      });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white">
            {pendingReset ? 'Reset Your Password' : 'Forgot Password?'}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {pendingReset 
              ? 'Enter the 6-digit OTP code and choose your new password. (Sandbox code: 123456)' 
              : 'Enter your email and we will send you an OTP to reset your password'
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

        {!pendingReset ? (
          <form onSubmit={handleRequestSubmit} className="space-y-5">
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
                suppressHydrationWarning
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3.5 text-xs font-bold text-white shadow-lg tracking-wide transition duration-200 disabled:opacity-50"
              suppressHydrationWarning
            >
              {loading ? 'Sending OTP Code...' : 'Send Password Reset OTP'}
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4">
              Remember your password? <Link href="/login" className="text-cyan-400 font-bold hover:underline">Log in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleConfirmSubmit} className="space-y-5">
            <div>
              <label htmlFor="otpCode" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">6-Digit OTP Code</label>
              <input 
                id="otpCode"
                type="text" 
                placeholder="e.g. 123456" 
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200 tracking-[0.2em] text-center font-mono text-lg"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <input 
                id="newPassword"
                type="password" 
                placeholder="••••••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200"
                suppressHydrationWarning
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3.5 text-xs font-bold text-white shadow-lg tracking-wide transition duration-200 disabled:opacity-50"
              suppressHydrationWarning
            >
              {loading ? 'Confirming Reset...' : 'Confirm Reset Password'}
            </button>

            <button 
              type="button" 
              onClick={() => setPendingReset(false)}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-white transition"
              suppressHydrationWarning
            >
              ← Back to request code
            </button>
          </form>
        )}
        
      </div>
    </div>
  );
}
