'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api';
import { ChatMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Toast from '../../components/Toast';

export default function MentorPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  
  const [toastMessage, setToastMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      const data = await api.get<ChatMessage[]>('/api/mentor/history');
      setMessages(data);
    } catch (err: any) {
      console.error('Failed to load chat history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchChatHistory();
    }
  }, [user]);

  // Auto-scroll chat panel to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInputText('');
    
    // Add user message locally immediately
    const mockUserMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, mockUserMsg]);
    
    setTyping(true);
    try {
      const reply = await api.post<ChatMessage>('/api/mentor/send', { content: text });
      setMessages(prev => [...prev, reply]);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to communicate with AI Mentor');
    } finally {
      setTyping(false);
    }
  };

  const promptChips = [
    "What metrics do VCs scan for at pre-seed?",
    "Show me a standard pitch deck structure checklist",
    "How should co-founders divide initial equity splits?",
    "Explain LTV to CAC ratio limits for B2B models"
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 flex flex-col gap-6">
      {/* Toast notifications */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="error" 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black text-sm relative">
            M
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">AI Startup Mentor v2.5</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Online • Automated validation co-pilot</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-6 h-[400px] overflow-y-auto flex flex-col gap-4 backdrop-blur-md">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id}
              className={`flex flex-col max-w-[80%] ${m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div 
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${m.sender === 'user' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none shadow-md' : 'bg-slate-950 border border-white/5 text-slate-300 rounded-bl-none'}`}
                dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br />') }}
              />
              <span className="text-[9px] text-slate-500 mt-1">
                {m.sender === 'user' ? 'You' : 'Mentor'} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        
        {typing && (
          <div className="self-start flex flex-col items-start max-w-[80%]">
            <div className="rounded-2xl px-4 py-3 text-xs text-slate-400 bg-slate-950 border border-white/5 rounded-bl-none flex items-center gap-2">
              <span className="animate-bounce shrink-0">●</span>
              <span className="animate-bounce delay-100 shrink-0">●</span>
              <span className="animate-bounce delay-200 shrink-0">●</span>
              Typing advice...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {promptChips.map((chip, i) => (
          <button 
            key={i}
            onClick={() => handleSendMessage(chip)}
            className="text-[10px] bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition font-semibold"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form Box */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
        className="flex gap-2 w-full"
      >
        <input 
          type="text" 
          placeholder="Ask a question about runways, margins, co-founder equity splits..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-200"
        />
        <button 
          type="submit"
          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-6 font-bold text-xs transition shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}
