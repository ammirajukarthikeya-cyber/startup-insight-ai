'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { TechUpdate } from '../../types';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<TechUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await api.get<TechUpdate[]>('/api/news');
        setNewsList(data);
      } catch (err: any) {
        console.error('Failed to load tech news feed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-10">
      
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Tech Updates & <span className="text-gradient-cyan">Ecosystem News</span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
          Emerging industry news updates, AI architectural shifts, cybersecurity threat models, and SaaS trends.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          {newsList.map((item) => (
            <div 
              key={item.id}
              className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex flex-col gap-4 backdrop-blur-md hover:border-white/10 transition"
            >
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                <span className="text-cyan-400 font-extrabold">{item.category}</span>
                <span>{new Date(item.date_published).toLocaleDateString()}</span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2">{item.title}</h3>
                <p className="text-xxs text-slate-400 leading-relaxed mt-2 line-clamp-3">{item.summary}</p>
              </div>

              <div className="border-t border-white/5 pt-3 mt-auto text-[10px] leading-relaxed text-slate-500">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
