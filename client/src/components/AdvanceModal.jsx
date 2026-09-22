import React, { useState } from 'react';
import { X, HandCoins, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { advanceApi } from '../services/api';

export default function AdvanceModal({ workers, preselectedWorkerId, isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [workerId, setWorkerId] = useState(preselectedWorkerId || (workers[0]?._id || ''));
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [reason, setReason] = useState('Advance against wages');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workerId) {
      setErrorMsg('Please select a worker');
      toast.error('Please select a worker');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid advance amount');
      toast.error('Please enter a valid advance amount');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await advanceApi.create({
        workerId,
        amount: Number(amount),
        paymentMode,
        reason,
        date,
      });
      setLoading(false);
      toast.success('Advance issued successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to record advance';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <HandCoins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Issue Worker Advance</h3>
              <p className="text-xs text-slate-400">Deducted automatically from Net Payable</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Worker Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Worker <span className="text-red-500">*</span>
            </label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
              required
            >
              <option value="">-- Choose Worker --</option>
              {workers.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.phone}) - Rate: ₹{w.dailyWageRate}/day
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Advance Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disbursement Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'Bank Transfer', 'UPI'].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    paymentMode === mode
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disbursement Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency medical expenses"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-600/30 flex items-center gap-2"
            >
              {loading ? 'Recording...' : 'Record Advance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
