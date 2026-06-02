'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { StartupEvent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

export default function EventsPage() {
  const { user } = useAuth();
  
  const [events, setEvents] = useState<StartupEvent[]>([]);
  const [bookmarks, setBookmarks] = useState<StartupEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'hackathons' | 'conferences' | 'pitch'>('all');
  
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [ticketDetails, setTicketDetails] = useState<any | null>(null);

  const fetchEventsData = async () => {
    try {
      const allEvents = await api.get<StartupEvent[]>('/api/events');
      setEvents(allEvents);
      if (user) {
        const bookmarked = await api.get<StartupEvent[]>('/api/events/bookmarked');
        setBookmarks(bookmarked);
      }
    } catch (err: any) {
      console.error('Failed to load events data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, [user]);

  const handleToggleBookmark = async (event: StartupEvent) => {
    if (!user) {
      setToastType('error');
      setToastMessage('Please login to bookmark events.');
      return;
    }
    const isBookmarked = bookmarks.some(b => b.id === event.id);
    try {
      if (isBookmarked) {
        await api.post('/api/events/unbookmark', { event_id: event.id });
        setBookmarks(prev => prev.filter(b => b.id !== event.id));
        setToastType('success');
        setToastMessage('Event bookmark removed successfully.');
      } else {
        await api.post('/api/events/bookmark', { event_id: event.id });
        setBookmarks(prev => [...prev, event]);
        setToastType('success');
        setToastMessage('Event bookmarked successfully.');
      }
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Bookmark action failed');
    }
  };

  const handleRegisterEvent = async (event: StartupEvent) => {
    if (!user) {
      setToastType('error');
      setToastMessage('Please login to register for events.');
      return;
    }
    setLoading(true);
    try {
      const ticket = await api.post(`/api/events/register/${event.id}`);
      setTicketDetails(ticket);
      setToastType('success');
      setToastMessage(`Successfully registered for ${event.title}!`);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Event registration failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => activeFilter === 'all' || e.event_type === activeFilter);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-10">
      {/* Toast notifications */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Startup <span className="text-gradient-purple-cyan">Events Hub</span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
          Book passes and register for high-impact hackathons, venture pitch showcases, workshops, and founder conferences.
        </p>
      </div>

      {/* Filter Options */}
      <div className="flex justify-center gap-2 border-b border-white/5 pb-4 max-w-md mx-auto w-full">
        {(['all', 'hackathons', 'conferences', 'pitch'] as const).map(type => (
          <button 
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`text-xs px-4 py-2 rounded-lg border capitalize font-bold transition ${activeFilter === type ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : 'border-white/5 text-slate-400 hover:bg-slate-900'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Events Grid layout */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start max-w-6xl mx-auto w-full">
          {filteredEvents.map((e) => {
            const isBookmarked = bookmarks.some(b => b.id === e.id);
            const dateObj = new Date(e.date);
            const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
            const day = dateObj.getDate();

            return (
              <div 
                key={e.id}
                className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex flex-col gap-4 relative hover:border-white/10 transition backdrop-blur-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="bg-slate-950/80 rounded-lg p-2 text-center min-w-[50px] border border-white/10">
                      <p className="text-[10px] text-cyan-400 font-bold tracking-wider">{month}</p>
                      <p className="text-base font-black text-white mt-0.5">{day}</p>
                    </div>
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${e.event_type === 'hackathons' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : e.event_type === 'conferences' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {e.event_type}
                      </span>
                      <h3 className="text-xs font-bold text-slate-100 mt-1 line-clamp-1">{e.title}</h3>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleToggleBookmark(e)}
                    className="text-slate-500 hover:text-cyan-400 transition"
                  >
                    <svg className={`h-5 w-5 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : 'none'}`} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                <p className="text-xxs text-slate-400 leading-relaxed min-h-[48px]">{e.description}</p>

                <div className="border-t border-white/5 pt-3 mt-1 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 truncate max-w-[150px]">{e.location}</span>
                  <button 
                    onClick={() => handleRegisterEvent(e)}
                    className="text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    Register Ticket →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket badge modal details */}
      {ticketDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative text-center flex flex-col items-center gap-4">
            <button 
              onClick={() => setTicketDetails(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Event Pass Activated!</h3>
              <p className="text-xs text-slate-400 mt-1">Your registration code is secured</p>
            </div>

            <div className="w-full rounded-xl bg-slate-950 border border-white/5 p-4 font-mono text-center text-slate-200 mt-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">TICKET ID</p>
              <p className="text-base font-bold text-cyan-400 mt-1">{ticketDetails.ticket_id}</p>
              <div className="border-t border-white/5 pt-2 mt-2 text-[9px] text-slate-400 text-left space-y-1">
                <p><strong>Location:</strong> {ticketDetails.location}</p>
                <p><strong>Date:</strong> {new Date(ticketDetails.date).toLocaleString()}</p>
              </div>
            </div>

            <button 
              onClick={() => setTicketDetails(null)}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2 text-xs font-bold transition w-full"
            >
              Dismiss Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
