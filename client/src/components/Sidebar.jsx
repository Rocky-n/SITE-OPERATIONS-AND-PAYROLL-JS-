import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck2,
  HandCoins,
  Calculator,
  ReceiptText,
  HardHat,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects (Sites)', icon: Building2 },
    { id: 'workers', label: 'Worker Registry', icon: Users },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck2 },
    { id: 'advances', label: 'Wage Advances', icon: HandCoins },
    { id: 'payroll', label: 'Payroll Engine', icon: Calculator },
    { id: 'ledger', label: 'Payment Ledger', icon: ReceiptText },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950">
        <img
          src="/js-logo.png"
          alt="JS Constructions"
          className="h-10 w-auto object-contain rounded-lg shadow-sm"
        />
        <div>
          <span className="font-bold text-base text-white tracking-wide">JS Constructions</span>
          <span className="block text-[11px] font-medium text-orange-400 uppercase tracking-wider">
            Site Operations
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Site Manager'}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{user?.phoneNumber}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
