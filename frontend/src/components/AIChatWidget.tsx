'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { ChatMessage } from '../types';

export default function AIChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  const getInitialGuestMessages = (): ChatMessage[] => [
    {
      id: 1,
      sender: 'system',
      content: "Hello! I am the Startup Insight AI helper. How can I assist you today?\n\nIf you are a member, please **Sign In** to chat with your personal AI Startup Mentor.",
      timestamp: new Date().toISOString()
    }
  ];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.get<ChatMessage[]>('/api/mentor/history');
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat history', err);
      // Fallback if API fails
      setMessages(getInitialGuestMessages());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (user) {
        fetchHistory();
      } else {
        setMessages(getInitialGuestMessages());
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setInputText('');

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    if (user) {
      // Authenticated AI Request
      try {
        const reply = await api.post<ChatMessage>('/api/mentor/send', { content: text });
        setMessages(prev => [...prev, reply]);
      } catch (err: any) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'system',
          content: `Error: ${err.message || 'Could not reach AI Server. Please try again later.'}`,
          timestamp: new Date().toISOString()
        }]);
      } finally {
        setTyping(false);
      }
    } else {
      // Guest local simulation responder
      setTimeout(() => {
        const lower = text.toLowerCase();
        let replyContent = "I'm here to help! Could you please clarify your question? You can ask about our 'features', 'pricing', 'security', or 'how to analyze' a startup idea.";

        if (lower.includes('pricing') || lower.includes('cost') || lower.includes('plan') || lower.includes('price')) {
          replyContent = "We have three main subscription plan tiers:\n\n- **Basic Plan**: ₹299/mo (5 startup idea scans, limited mentor chat)\n- **Pro Plan**: ₹999/mo (Unlimited startup idea scans, unlimited mentor chat, PDF exports)\n- **Enterprise Plan**: ₹4999/mo (VC matching, up to 5 team seats, priority API speeds)\n\nWe support secure automated UPI payment transfers and bank validation.";
        } else if (lower.includes('feature') || lower.includes('tool') || lower.includes('what can i do')) {
          replyContent = "Startup Insight AI provides early-stage entrepreneurs with tools to:\n\n1. **Analyze Startup Ideas**: Input pitch text to get feasibility, SWOT, and health scores.\n2. **Map Competitors**: Discover current competitors, their share, and disruption strategies.\n3. **Scan Vulnerabilities**: Identify cash-burn risk vectors and regulatory obstacles.\n4. **Explore Events**: Browse and sign up for global hackathons, conferences, and angel pitches.\n5. **Consult AI Mentor**: Chat 24/7 for customized runway calculations and coaching.";
        } else if (lower.includes('safe') || lower.includes('secure') || lower.includes('privacy') || lower.includes('leak')) {
          replyContent = "Your privacy is our priority. All pitch drafts and evaluations are sandboxed inside your secure account and encrypted. We do not sell your ideas or train public foundation models on your proprietary inputs.";
        } else if (lower.includes('how') || lower.includes('start') || lower.includes('scan') || lower.includes('analyze')) {
          replyContent = "It's easy to get started! \n\n1. Go to the [Idea Analyzer](/analyzer) page.\n2. Choose your industry vertical and target market region.\n3. Write a short description (pitch) of your business concept.\n4. Click **Generate Diagnostic Analysis** to see your interactive SVG radar chart and detailed feedback.";
        } else if (lower.includes('login') || lower.includes('signin') || lower.includes('register') || lower.includes('account')) {
          replyContent = "To access customized AI mentoring and save your scan histories, please [Sign In](/login) or [Register](/register) for a new account. The basic free tier includes standard validation access!";
        }

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'system',
          content: replyContent,
          timestamp: new Date().toISOString()
        }]);
        setTyping(false);
      }, 800);
    }
  };

  const guestChips = [
    "What features are available?",
    "How does pricing work?",
    "Is my idea kept secure?",
    "How do I start a scan?"
  ];

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 hover:scale-105 transition active:scale-95"
        aria-label="Ask AI Assistant"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Floating Chat Panel Box */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[350px] sm:w-[380px] flex-col rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl transition duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/40 p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-xs font-bold text-white">
                AI
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-slate-950" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Startup AI Copilot</h3>
                <p className="text-[9px] text-slate-400">Online • Live doubts clarification</p>
              </div>
            </div>
            {/* Mode Indicator */}
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] font-semibold text-slate-300">
              {user ? 'Member' : 'Guest'}
            </span>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <svg className="h-6 w-6 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 text-xxs leading-relaxed ${m.sender === 'user' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none' : 'bg-slate-900 border border-white/5 text-slate-300 rounded-bl-none'}`}
                    dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br />') }}
                  />
                  <span className="mt-0.5 text-[8px] text-slate-500">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}

            {typing && (
              <div className="self-start flex flex-col items-start max-w-[80%]">
                <div className="rounded-2xl px-3 py-2 text-xxs text-slate-400 bg-slate-900 border border-white/5 rounded-bl-none flex items-center gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQ Chips for Guests */}
          {!user && messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-white/5 flex flex-wrap gap-1.5 bg-slate-950/40">
              {guestChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip)}
                  className="rounded-full border border-white/5 bg-slate-900 px-2 py-1 text-[9px] text-slate-400 hover:text-white transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Box Form */}
          <form
            onSubmit={e => { e.preventDefault(); handleSend(inputText); }}
            className="flex items-center gap-2 border-t border-white/5 p-3 bg-slate-900/40"
          >
            <input
              type="text"
              placeholder={user ? "Ask anything..." : "Ask a query or type 'pricing'..."}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xxs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-3 py-2 text-xxs font-bold text-white shadow-md hover:bg-purple-500 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
