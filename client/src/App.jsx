import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Workers from './pages/Workers';
import Attendance from './pages/Attendance';
import Advances from './pages/Advances';
import Payroll from './pages/Payroll';
import Ledger from './pages/Ledger';
import { Loader2 } from 'lucide-react';

function MainLayout() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Initialize dark mode class from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Initializing JS Constructions System...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const titles = {
    dashboard: 'Dashboard Overview',
    projects: 'Construction Sites ("Running Applications")',
    workers: 'Worker Directory & Wage Setup',
    attendance: 'Daily Attendance Roster',
    advances: 'Wage Advances Tracking',
    payroll: 'Dynamic Payroll Calculation & Checkout',
    ledger: 'Payment Transactions & Ledger',
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Fixed Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Navbar title={titles[activeTab] || 'Construction Management'} />
        <main className="flex-1 pb-16">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'projects' && <Projects />}
          {activeTab === 'workers' && <Workers />}
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'advances' && <Advances />}
          {activeTab === 'payroll' && <Payroll />}
          {activeTab === 'ledger' && <Ledger />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <MainLayout />
    </ErrorBoundary>
  );
}
