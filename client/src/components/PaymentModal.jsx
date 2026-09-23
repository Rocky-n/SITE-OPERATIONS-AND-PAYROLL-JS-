import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Landmark,
  Banknote,
  Copy,
  Check,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi } from '../services/api';

const NETBANKING_BANKS = [
  {
    name: 'Indian Overseas Bank (IOB)',
    code: 'IOB',
    url: 'https://netbanking.iob.bank.in/ibanking/login.do',
  },
  {
    name: 'State Bank of India (SBI)',
    code: 'SBI',
    url: 'https://retail.sbi.bank.in/',
  },
  {
    name: 'HDFC Bank',
    code: 'HDFC',
    url: 'https://netbanking.hdfcbank.com/netbanking/',
  },
  {
    name: 'ICICI Bank',
    code: 'ICICI',
    url: 'https://infinity.icicibank.com/',
  },
  {
    name: 'Axis Bank',
    code: 'AXIS',
    url: 'https://retail.axisbank.co.in/',
  },
];

export default function PaymentModal({ worker, isOpen, onClose, onSuccess }) {
  if (!isOpen || !worker) return null;

  const workerObj = worker.worker || worker;
  const workerName = workerObj?.name || 'Worker';
  const workerPhone = workerObj?.phone || '';

  const [method, setMethod] = useState('Cash');
  const [amount, setAmount] = useState(worker.netPayable || 0);

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState(NETBANKING_BANKS[0]);

  // Copy state for UPI
  const [copied, setCopied] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state with incoming worker
  useEffect(() => {
    if (worker) {
      setAmount(worker.netPayable || 0);
      setMethod('Cash');
      setSelectedBank(NETBANKING_BANKS[0]);
      setCopied(false);
      setErrorMsg('');
    }
  }, [worker]);

  // Copy phone number to clipboard
  const handleCopyPhone = async () => {
    if (!workerPhone) return;
    try {
      await navigator.clipboard.writeText(workerPhone.replace(/\D/g, '').slice(-10) || workerPhone);
      setCopied(true);
      toast.success('Mobile number copied!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy phone number:', err);
    }
  };

  // 1. Cash Payment -> Marks instantly as "Paid" after confirmation
  const handlePayCash = async () => {
    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid disbursement amount');
      toast.error('Please enter a valid disbursement amount');
      return;
    }

    const confirmed = window.confirm("Are you sure you want to mark this as Paid?");
    if (!confirmed) return;

    setLoading(true);
    setErrorMsg('');

    try {
      await paymentApi.record({
        workerId: workerObj._id,
        amount: Number(amount),
        paymentMethod: 'Cash',
        status: 'Paid',
        details: {
          notes: 'Handed cash on site',
        },
      });

      setLoading(false);
      toast.success('Cash payment recorded successfully');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to record cash payment';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  // 2. UPI / Mobile Wallet Payment -> Confirms as "Paid" after confirmation
  const handlePayUPI = async () => {
    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid disbursement amount');
      toast.error('Please enter a valid disbursement amount');
      return;
    }

    const confirmed = window.confirm("Are you sure you want to mark this as Paid?");
    if (!confirmed) return;

    setLoading(true);
    setErrorMsg('');

    try {
      await paymentApi.record({
        workerId: workerObj._id,
        amount: Number(amount),
        paymentMethod: 'UPI',
        status: 'Paid',
        details: {
          phoneNumber: workerPhone,
          notes: `Manual UPI transfer to ${workerPhone}`,
        },
      });

      setLoading(false);
      toast.success('UPI payment confirmed and marked as Paid');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to confirm UPI payment';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  // 3. Netbanking Payment -> Opens Bank URL & Records as "Paid" after confirmation
  const handlePayNetbanking = async () => {
    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid disbursement amount');
      toast.error('Please enter a valid disbursement amount');
      return;
    }

    const confirmed = window.confirm("Are you sure you want to mark this as Paid?");
    if (!confirmed) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // Open the bank's official portal in a new tab
      if (selectedBank?.url) {
        window.open(selectedBank.url, '_blank', 'noopener,noreferrer');
      }

      // Record transaction with status "Paid" and paymentMethod including bank code
      await paymentApi.record({
        workerId: workerObj._id,
        amount: Number(amount),
        paymentMethod: `Netbanking - ${selectedBank.code}`,
        status: 'Paid',
        details: {
          bankName: selectedBank.name,
          notes: `Netbanking payment via ${selectedBank.name}`,
        },
      });

      setLoading(false);
      toast.success(`Netbanking payment via ${selectedBank.name} recorded as Paid`);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to record Netbanking transaction';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setLoading(false);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg mx-auto max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors my-auto">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Pay Worker Salary</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Checkout &amp; Disbursal</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker Summary Banner */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-50 dark:bg-orange-950/40 border-b border-orange-100 dark:border-orange-900/40 flex items-center justify-between text-xs shrink-0">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{workerName}</span>
            <span className="text-slate-500 dark:text-slate-400 ml-1.5">({workerObj?.role || 'Worker'})</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Current Net Payable: </span>
            <span className="font-bold text-orange-700 dark:text-orange-400 text-sm">₹{worker.netPayable?.toLocaleString()}</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Selector (3 Options: Cash, UPI / Mobile Wallet, Netbanking) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Cash Option */}
              <button
                type="button"
                onClick={() => setMethod('Cash')}
                className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-h-[52px] ${
                  method === 'Cash'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-600/30 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Cash</span>
              </button>

              {/* UPI / Mobile Wallet Option */}
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-h-[52px] ${
                  method === 'UPI'
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 ring-2 ring-purple-600/30 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-5 h-5 text-purple-600 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">UPI / Wallet</span>
              </button>

              {/* Netbanking Option */}
              <button
                type="button"
                onClick={() => setMethod('Netbanking')}
                className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-h-[52px] ${
                  method === 'Netbanking'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 ring-2 ring-blue-600/30 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Landmark className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Netbanking</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disbursement Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                min="1"
                max={worker.netPayable > 0 ? worker.netPayable : 100000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Defaults to current net payable amount (₹{worker.netPayable}).
            </p>
          </div>

          {/* 1. Cash Section */}
          {method === 'Cash' && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span>Direct Cash Payment</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Instant Paid
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Net Payable Amount:</span>
                <span className="text-base font-black text-emerald-700">₹{Number(amount).toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Clicking <strong>"Mark as Paid"</strong> immediately records this cash payment and updates the worker's status to Paid.
              </p>
            </div>
          )}

          {/* 2. UPI / Mobile Wallet Section */}
          {method === 'UPI' && (
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                  <Smartphone className="w-4 h-4 text-purple-700" />
                  <span>Manual UPI / Mobile Transfer</span>
                </div>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                  PhonePe / GPay / Paytm
                </span>
              </div>

              {/* Worker Phone Number with Copy Button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Worker Mobile / UPI Number
                </label>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {workerPhone || 'No phone number on record'}
                    </span>
                  </div>
                  {workerPhone && (
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Transfer Instructions */}
              <div className="p-3.5 bg-white/80 rounded-xl border border-purple-100 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p className="font-bold text-purple-900">Transfer Instructions:</p>
                <p>1. Open your UPI app (PhonePe, Google Pay, Paytm, etc.).</p>
                <p>2. Send <strong>₹{Number(amount).toLocaleString()}</strong> manually to the mobile number above.</p>
                <p>3. Once the transfer is complete on your app, click <strong>"Confirm Payment"</strong> below to record it as Paid in the ledger.</p>
              </div>
            </div>
          )}

          {/* 3. Netbanking Section */}
          {method === 'Netbanking' && (
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                <Landmark className="w-4 h-4 text-blue-700" />
                <span>Select Bank Portal</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Choose Bank <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBank.name}
                  onChange={(e) => {
                    const bank = NETBANKING_BANKS.find((b) => b.name === e.target.value);
                    if (bank) setSelectedBank(bank);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                >
                  {NETBANKING_BANKS.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 bg-white/90 rounded-xl border border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
                <span className="truncate pr-2">
                  Target: <strong className="font-mono text-blue-700">{selectedBank.url}</strong>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>

            {/* Cash: Mark as Paid */}
            {method === 'Cash' && (
              <button
                type="button"
                onClick={handlePayCash}
                disabled={loading || !amount || amount <= 0}
                className="min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Paid</span>
                  </>
                )}
              </button>
            )}

            {/* UPI: Confirm Payment */}
            {method === 'UPI' && (
              <button
                type="button"
                onClick={handlePayUPI}
                disabled={loading || !amount || amount <= 0}
                className="min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Payment</span>
                  </>
                )}
              </button>
            )}

            {/* Netbanking: Proceed to Netbanking */}
            {method === 'Netbanking' && (
              <button
                type="button"
                onClick={handlePayNetbanking}
                disabled={loading || !amount || amount <= 0}
                className="min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening Portal...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Netbanking</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
