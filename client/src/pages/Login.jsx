import React, { useState } from 'react';
import {
  HardHat,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(phoneNumber.trim());
      if (res.success) {
        toast.success('Welcome Devendiran S', { 
          icon: '👋', 
          position: 'top-center', 
          duration: 1000,
          style: { 
            marginTop: '45vh', 
            fontSize: '1.5rem', 
            padding: '20px 40px',
            fontWeight: 'bold',
            minWidth: 'min(350px, 90vw)',
            maxWidth: '90vw',
            boxSizing: 'border-box',
            textAlign: 'center',
          } 
        });
      } else {
        // 3. Dynamic Error Handling: Display actual message returned
        setError(res.message || 'Login failed');
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      // 3. Dynamic Error Handling: Display actual error message returned
      const msg = err.response?.data?.message || err.message || 'An unexpected error occurred';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <img
            src="/js-logo.png"
            alt="JS Constructions Logo"
            className="h-16 w-auto object-contain mx-auto mb-4 drop-shadow-md"
          />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">JS Constructions</h1>
          <p className="text-slate-400 text-sm mt-1">
            Construction Worker &amp; Site Management System
          </p>
        </div>

        {/* Minimal Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              JS Constructions Admin
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your authorized mobile number to manage site operations.
            </p>
          </div>

          {/* Dynamic Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-mono"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>Restricted Internal Organizational Access</span>
        </div>
      </div>
    </div>
  );
}
