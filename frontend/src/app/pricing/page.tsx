'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { SubscriptionPlan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../../components/PaymentModal';
import Toast from '../../components/Toast';

export default function PricingPage() {
  const { user, refreshProfile } = useAuth();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await api.get<SubscriptionPlan[]>('/api/billing/plans');
        setPlans(data);
      } catch (err: any) {
        console.error('Failed to load plans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleCheckoutSuccess = async (invoiceId: string) => {
    setSelectedPlan(null);
    setToastType('success');
    setToastMessage(`Payment simulation successful! Invoice generated: ${invoiceId}`);
    await refreshProfile();
  };

  const handleCheckoutFailure = (msg: string) => {
    setToastType('error');
    setToastMessage(msg);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 text-center">
      {/* Toast popup */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Flexible Plans for <span className="text-gradient-purple-cyan font-extrabold">Any Launch Scale</span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base">
          Unlock deep validator metrics, direct VC networks, and advanced SWOTS. Upgrade or cancel anytime.
        </p>

        {/* Monthly/Yearly toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white font-bold' : 'text-slate-500'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 rounded-full bg-slate-800 border border-white/10 p-1 flex items-center relative transition duration-300"
          >
            <div className={`w-4 h-4 rounded-full bg-cyan-400 shadow-md transition duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-white font-bold' : 'text-slate-500'}`}>
            Yearly
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold uppercase">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plans List Cards */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((p) => {
            const isUserTier = user?.subscription_tier === p.name;
            const features = JSON.parse(p.features_json) as string[];
            const price = billingCycle === 'monthly' ? p.monthly_price : p.yearly_price * 0.8; // Apply 20% discount visually
            const perMonth = billingCycle === 'monthly' ? price : price / 12;

            return (
              <div 
                key={p.id}
                className={`rounded-2xl border bg-slate-900/40 p-8 flex flex-col gap-6 text-left relative overflow-hidden backdrop-blur-md transition duration-300 ${p.name === 'Pro Plan' ? 'border-cyan-500/50 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] bg-slate-900/60 scale-105' : 'border-white/5 hover:border-white/10'}`}
              >
                {p.name === 'Pro Plan' && (
                  <div className="absolute top-4 right-4 bg-cyan-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Recommended
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 min-h-[32px]">{p.description}</p>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline text-white">
                    <span className="text-3xl font-black">₹{Math.round(perMonth)}</span>
                    <span className="text-xs text-slate-500 ml-1">/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {billingCycle === 'yearly' ? `Billed ₹${Math.round(price)} annually` : 'Billed monthly'}
                  </p>
                </div>

                {/* Features Checklist */}
                <ul className="space-y-3 flex-1">
                  {features.map((f, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-slate-300 items-start">
                      <svg className="h-4.5 w-4.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Actions button */}
                {user ? (
                  <button 
                    onClick={() => isUserTier ? null : setSelectedPlan(p)}
                    disabled={isUserTier || user.subscription_tier === 'Enterprise' && p.name !== 'Enterprise'}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition shadow-md ${isUserTier ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 disabled:opacity-30'}`}
                  >
                    {isUserTier ? 'Active Tier' : 'Upgrade Plan'}
                  </button>
                ) : (
                  <a 
                    href="/login"
                    className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold text-center block transition"
                  >
                    Login To Subscribe
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout modal popup */}
      {selectedPlan && (
        <PaymentModal 
          plan={selectedPlan}
          billingCycle={billingCycle}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleCheckoutSuccess}
          onFailure={handleCheckoutFailure}
        />
      )}
    </div>
  );
}
