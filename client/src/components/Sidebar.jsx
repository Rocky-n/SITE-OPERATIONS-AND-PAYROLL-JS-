import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck2,
  HandCoins,
  Calculator,
  ReceiptText,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
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

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  const renderNavContent = (isMobile = false) => (
    <>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950 shrink-0">
        <div className="flex items-center gap-3">
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

        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
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
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] cursor-pointer ${
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
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name === 'Site Manager' ? 'Devendiran S' : (user?.name || 'Devendiran S')}
            </p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{user?.phoneNumber}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar (Hidden on mobile <768px) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 min-h-screen border-r border-slate-800">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Slide-Out Drawer & Backdrop (<768px) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer container */}
          <aside className="relative w-72 max-w-[82vw] bg-slate-900 text-slate-300 flex flex-col h-full z-10 shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
