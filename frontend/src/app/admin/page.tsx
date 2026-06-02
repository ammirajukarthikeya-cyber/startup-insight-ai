'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminSummaryMetrics, SubscriptionPlan, User } from '../../types';
import Toast from '../../components/Toast';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'billing' | 'content'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(20);
  const [couponMax, setCouponMax] = useState(100);

  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planMonthly, setPlanMonthly] = useState(299);
  const [planYearly, setPlanYearly] = useState(2990);
  const [planTrial, setPlanTrial] = useState(7);
  const [planFeatures, setPlanFeatures] = useState('["Feature A", "Feature B"]');

  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('ai');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('hackathons');
  const [eventDate, setEventDate] = useState('');
  const [eventLoc, setEventLoc] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const fetchAdminData = async () => {
    try {
      const [metricsData, listUsers, listPlans] = await Promise.all([
        api.get('/api/admin/metrics'),
        api.get<any[]>('/api/admin/users'),
        api.get<SubscriptionPlan[]>('/api/billing/plans')
      ]);
      setMetrics(metricsData);
      setUserList(listUsers);
      setPlans(listPlans);
    } catch (err: any) {
      console.error('Failed to load admin metrics', err);
      setToastType('error');
      setToastMessage(err.message || 'Access Forbidden');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'admin') {
      router.push('/dashboard');
    } else {
      fetchAdminData();
    }
  }, [user]);

  // Operations
  const handleToggleUser = async (uId: number) => {
    try {
      await api.post(`/api/admin/users/${uId}/toggle-status`);
      setToastType('success');
      setToastMessage('User status toggled successfully');
      fetchAdminData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async (uId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${uId}`);
      setToastType('success');
      setToastMessage('User account deleted');
      fetchAdminData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to delete user');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/coupons', {
        code: couponCode,
        discount_percent: couponDiscount,
        max_redemptions: couponMax
      });
      setToastType('success');
      setToastMessage(`Coupon ${couponCode} created successfully!`);
      setCouponCode('');
      fetchAdminData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Coupon creation failed');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/plans', {
        name: planName,
        description: planDesc,
        monthly_price: planMonthly,
        yearly_price: planYearly,
        trial_duration_days: planTrial,
        features_json: planFeatures,
        limits_json: '{"scans": -1}'
      });
      setToastType('success');
      setToastMessage(`Plan ${planName} created dynamically!`);
      setPlanName('');
      setPlanDesc('');
      fetchAdminData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Plan creation failed');
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/news', {
        title: newsTitle,
        category: newsCategory,
        summary: newsSummary,
        content: newsContent
      });
      setToastType('success');
      setToastMessage('News article posted.');
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Posting news failed');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/events', {
        title: eventTitle,
        description: eventDesc,
        event_type: eventType,
        date: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
        location: eventLoc
      });
      setToastType('success');
      setToastMessage('Startup Event posted successfully.');
      setEventTitle('');
      setEventDesc('');
      setEventLoc('');
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Posting event failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-10">
      {/* Toast popup */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* Profile summary banner */}
      <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md shadow-[0_0_20px_-10px_rgba(124,58,237,0.2)]">
        <div>
          <h2 className="text-xl font-bold text-white">Administrative Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Configure subscription pricing matrices, user lists, and tech news dynamically.</p>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex gap-2">
          {(['metrics', 'users', 'billing', 'content'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-3.5 py-2 rounded-lg border capitalize font-bold transition ${activeTab === tab ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' : 'border-white/5 text-slate-400 hover:bg-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs panels mapping */}
      <div className="min-h-[400px]">
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Stats widgets */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="rounded-xl bg-slate-900/40 border border-white/5 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Users</p>
                <p className="text-2xl font-black text-white mt-1">{metrics.total_users}</p>
              </div>
              <div className="rounded-xl bg-slate-900/40 border border-white/5 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Active Users</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{metrics.active_users}</p>
              </div>
              <div className="rounded-xl bg-slate-900/40 border border-white/5 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Platform Revenue</p>
                <p className="text-2xl font-black text-cyan-400 mt-1">₹{metrics.total_revenue}</p>
              </div>
              <div className="rounded-xl bg-slate-900/40 border border-white/5 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Analyses Run</p>
                <p className="text-2xl font-black text-purple-400 mt-1">{metrics.total_analyses}</p>
              </div>
              <div className="rounded-xl bg-slate-900/40 border border-white/5 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Event Registrations</p>
                <p className="text-2xl font-black text-blue-400 mt-1">{metrics.total_registrations}</p>
              </div>
            </div>

            {/* Transactions table */}
            <div className="rounded-xl bg-slate-900/40 border border-white/5 p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Recent Ledger Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Invoice</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recent_transactions.map((tx: any) => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-slate-950/20">
                        <td className="p-3 font-semibold text-slate-100">{tx.invoice_id || 'N/A'}</td>
                        <td className="p-3 text-cyan-400 font-bold">₹{tx.amount}</td>
                        <td className="p-3">{tx.payment_gateway}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="rounded-xl bg-slate-900/40 border border-white/5 p-6 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Database User Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">User Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Active Status</th>
                    <th className="p-3">Subscription Tier</th>
                    <th className="p-3">Registration Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-slate-950/20">
                      <td className="p-3 font-semibold text-slate-100">{u.email}</td>
                      <td className="p-3 capitalize">{u.role}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-3">{u.subscription_tier}</td>
                      <td className="p-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right flex justify-end gap-2 text-[10px]">
                        <button 
                          onClick={() => handleToggleUser(u.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="bg-rose-950 hover:bg-rose-900 text-rose-400 px-2 py-1 rounded border border-rose-500/20"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-300">
            {/* Create subscription plan */}
            <div className="rounded-xl bg-slate-900/40 border border-white/5 p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Create Subscription Plan</h3>
              <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
                <input 
                  type="text" 
                  placeholder="Plan Name (e.g. Starter Plan)" 
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                />
                <input 
                  type="text" 
                  placeholder="Short Description" 
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="number" 
                    placeholder="Monthly price" 
                    value={planMonthly}
                    onChange={(e) => setPlanMonthly(Number(e.target.value))}
                    required
                    className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                  />
                  <input 
                    type="number" 
                    placeholder="Yearly price" 
                    value={planYearly}
                    onChange={(e) => setPlanYearly(Number(e.target.value))}
                    required
                    className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                  />
                  <input 
                    type="number" 
                    placeholder="Trial Days" 
                    value={planTrial}
                    onChange={(e) => setPlanTrial(Number(e.target.value))}
                    className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                  />
                </div>
                <textarea 
                  rows={3} 
                  placeholder='Features Array (JSON format e.g. ["Feature 1", "Feature 2"])'
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200 font-mono"
                />
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-2.5 rounded font-bold text-white">
                  Add Plan Matrix
                </button>
              </form>
            </div>

            {/* Create discount coupons */}
            <div className="rounded-xl bg-slate-900/40 border border-white/5 p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Create Discount Coupon</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <input 
                  type="text" 
                  placeholder="Coupon Code (e.g. WELCOME50)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  required
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Discount Percent" 
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(Number(e.target.value))}
                    required
                    className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                  />
                  <input 
                    type="number" 
                    placeholder="Max Redemptions" 
                    value={couponMax}
                    onChange={(e) => setCouponMax(Number(e.target.value))}
                    className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                  />
                </div>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-2.5 rounded font-bold text-white">
                  Add Discount Coupon
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-300">
            {/* Create tech updates news */}
            <div className="rounded-xl bg-slate-900/40 border border-white/5 p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Publish Tech Update News</h3>
              <form onSubmit={handleCreateNews} className="space-y-4 text-xs">
                <input 
                  type="text" 
                  placeholder="Article Title" 
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  required
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                />
                <select 
                  value={newsCategory}
                  onChange={(e) => setNewsCategory(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-400"
                >
                  <option value="ai">AI Frontiers</option>
                  <option value="cybersecurity">Cybersecurity</option>
                  <option value="cloud">Cloud Computing</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="saas">SaaS Trends</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Short Summary" 
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  required
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                />
                <textarea 
                  rows={4} 
                  placeholder="Detailed report content..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  required
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200 leading-relaxed"
                />
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-2.5 rounded font-bold text-white">
                  Publish News Post
                </button>
              </form>
            </div>

            {/* Create events poster */}
            <div className="rounded-xl bg-slate-900/40 border border-white/5 p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Post Startup Event</h3>
              <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                <input 
                  type="text" 
                  placeholder="Event Title" 
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                />
                <input 
                  type="text" 
                  placeholder="Short Description" 
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  required
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-400"
                  >
                    <option value="hackathons">Hackathon</option>
                    <option value="conferences">Conference</option>
                    <option value="pitch">Pitch Contest</option>
                  </select>
                  <input 
                    type="datetime-local" 
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-400"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Location (e.g. San Francisco, CA or Online / Zoom)" 
                  value={eventLoc}
                  onChange={(e) => setEventLoc(e.target.value)}
                  required
                  className="w-full rounded bg-slate-950 border border-white/10 p-2.5 text-slate-200"
                />
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-2.5 rounded font-bold text-white">
                  Post Event Listing
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
