'use client';

import React, { useState } from 'react';
import { SubscriptionPlan } from '../types';
import { api } from '../utils/api';

interface PaymentModalProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
  onFailure: (message: string) => void;
}

export default function PaymentModal({ plan, billingCycle, onClose, onSuccess, onFailure }: PaymentModalProps) {
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [utr, setUtr] = useState('');

  const originalPrice = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
  const discountAmount = couponApplied ? originalPrice * (discountPercent / 100) : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const data = await api.post(`/api/billing/coupons/validate?code=${couponCode}`);
      setDiscountPercent(data.discount_percent);
      setCouponApplied(true);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
      setCouponApplied(false);
    }
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    
    let refId = '';
    if (paymentMethod === 'card') {
      if (cardNumber.length < 16) {
        onFailure('Please enter a valid 16-Digit Card Number.');
        setLoading(false);
        return;
      }
      refId = `CARD-***${cardNumber.slice(-4)}`;
    } else if (paymentMethod === 'upi') {
      if (!utr || utr.trim().length < 6) {
        onFailure('Please enter a valid UPI UTR / Reference Transaction ID.');
        setLoading(false);
        return;
      }
      refId = utr;
    } else {
      refId = `PAYPAL-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    try {
      const res = await api.post('/api/billing/submit-manual-payment', {
        plan_id: plan.id,
        amount: finalPrice,
        payment_method: paymentMethod.toUpperCase(),
        utr_number: refId
      });
      
      onSuccess(`PENDING:${res.message || 'Payment reference submitted successfully!'}`);
      setLoading(false);
    } catch (err: any) {
      onFailure(err.message || 'Failed to submit payment reference');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Subscribe to {plan.name}</h3>
            <p className="text-xs text-slate-400">Complete checkout simulation sandbox</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="mb-6 rounded-xl bg-slate-950/50 p-4 border border-white/5">
          <div className="flex justify-between text-sm mb-2 text-slate-400">
            <span>{plan.name} ({billingCycle})</span>
            <span>₹{originalPrice.toFixed(2)}</span>
          </div>

          {couponApplied && (
            <div className="flex justify-between text-xs text-emerald-500 mb-2 font-medium">
              <span>Promo Coupon Discount ({discountPercent}%)</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white text-base">
            <span>Total Payable</span>
            <span className="text-cyan-400">₹{finalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Coupon Code Panel */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Discount Coupon</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. WELCOME50" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={couponApplied}
              className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200"
            />
            <button 
              onClick={handleApplyCoupon}
              disabled={couponApplied}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 text-xs font-bold transition disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          {couponError && <p className="text-xs text-rose-500 mt-1">{couponError}</p>}
          {couponApplied && <p className="text-xs text-emerald-400 mt-1">Discount applied successfully!</p>}
        </div>

        {/* Payment Select tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition flex flex-col items-center gap-1 ${paymentMethod === 'card' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}
            >
              Credit Card
            </button>
            <button 
              onClick={() => setPaymentMethod('upi')}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition flex flex-col items-center gap-1 ${paymentMethod === 'upi' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}
            >
              UPI Payments
            </button>
            <button 
              onClick={() => setPaymentMethod('paypal')}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition flex flex-col items-center gap-1 ${paymentMethod === 'paypal' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}
            >
              PayPal
            </button>
          </div>
        </div>

        {/* Input Details based on active payment method */}
        <div className="mb-6 min-h-[100px]">
          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Card Number (16 Digits)" 
                maxLength={16}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                />
                <input 
                  type="text" 
                  placeholder="CVC" 
                  maxLength={3}
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="space-y-3 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] text-purple-400 font-bold mb-1">Send exact amount of ₹{finalPrice.toFixed(2)} to UPI ID: ammirajukarthikeya@okaxis</p>
              <input 
                type="text" 
                placeholder="Your UPI ID (e.g. user@okaxis)" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200"
              />
              <input 
                type="text" 
                placeholder="Enter 12-Digit Transaction UTR / Ref No." 
                maxLength={12}
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\s/g, ''))}
                className="w-full rounded-lg border border-purple-500/30 bg-slate-950 px-3 py-2 text-sm text-slate-200 font-semibold text-center tracking-wide"
                required
              />
              <div className="p-3 bg-white rounded-lg inline-block">
                {/* Simulated UPI Scan QR Code placeholder */}
                <div className="h-28 w-28 bg-slate-300 flex items-center justify-center border-2 border-slate-950 text-slate-950 font-bold text-xs tracking-wider">
                  UPI QR CODE
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Scan QR code, transfer, and enter UTR Ref above</p>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="text-center py-4 bg-slate-950/30 border border-dashed border-white/10 rounded-lg">
              <p className="text-sm text-slate-300 mb-2">Simulating Paypal gateway route redirection</p>
              <p className="text-xs text-slate-400">Pay to PayPal ID: ammirajukarthikeya@paypal</p>
            </div>
          )}
        </div>

        {/* Process button */}
        <button 
          onClick={handleProcessPayment}
          disabled={loading || (paymentMethod === 'card' && cardNumber.length < 16) || (paymentMethod === 'upi' && utr.trim().length < 6)}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting request...
            </>
          ) : (
            `Submit Payment for Admin Approval`
          )}
        </button>
      </div>
    </div>
  );
}
