import React from 'react';
import { Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div className="flex items-center gap-3">
        <img
          src="/js-logo.png"
          alt="JS Constructions Logo"
          className="h-8 w-auto object-contain hidden sm:block"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-500">JS Constructions • Site Operations &amp; Payroll</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Current Date Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{todayStr}</span>
        </div>

        {/* Manager Auth Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg text-xs font-medium text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Authorized Staff</span>
        </div>
      </div>
    </header>
  );
}
