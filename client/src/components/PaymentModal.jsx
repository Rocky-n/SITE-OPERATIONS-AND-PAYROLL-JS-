import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Landmark,
  Banknote,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
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

  const [method, setMethod] = useState('Netbanking');
  const [amount, setAmount] = useState(worker.netPayable || 0);
  const [phonePeNumber, setPhonePeNumber] = useState(worker.worker?.phone || '');
  const [selectedBank, setSelectedBank] = useState(NETBANKING_BANKS[0]);
  const [cashNotes, setCashNotes] = useState('Handed cash on site');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid amount to pay');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    // 1. Netbanking Flow: Opens bank in new tab & records with status "Pending"
    if (method === 'Netbanking') {
      try {
        if (selectedBank?.url) {
          window.open(selectedBank.url, '_blank', 'noopener,noreferrer');
        }

        await paymentApi.record({
          workerId: worker.worker._id,
          amount: Number(amount),
          paymentMethod: 'Netbanking',
          status: 'Pending',
          details: {
            bankName: selectedBank.name,
            notes: `Netbanking - ${selectedBank.code}`,
          },
        });

        setLoading(false);
        if (onSuccess) onSuccess();
        handleClose();
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.response?.data?.message || 'Failed to record Netbanking transaction');
      }
      return;
    }

    // 2. PhonePe Flow: Opens PhonePe in new tab & records with status "Pending"
    if (method === 'PhonePe') {
      if (!phonePeNumber) {
        setLoading(false);
        setErrorMsg('Please enter receiver PhonePe number');
        return;
      }

      try {
        // Open PhonePe in new tab
        window.open('https://www.phonepe.com/', '_blank', 'noopener,noreferrer');

        await paymentApi.record({
          workerId: worker.worker._id,
          amount: Number(amount),
          paymentMethod: 'PhonePe',
          status: 'Pending',
          details: {
            phoneNumber: phonePeNumber,
            notes: `PhonePe transfer to ${phonePeNumber}`,
          },
        });

        setLoading(false);
        if (onSuccess) onSuccess();
        handleClose();
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.response?.data?.message || 'Failed to record PhonePe transaction');
      }
      return;
    }

    // 3. Cash Flow: Immediately sets status to "Paid"
    if (method === 'Cash') {
      try {
        await paymentApi.record({
          workerId: worker.worker._id,
          amount: Number(amount),
          paymentMethod: 'Cash',
          status: 'Paid',
          details: {
            notes: cashNotes,
          },
        });

        setLoading(false);
        if (onSuccess) onSuccess();
        handleClose();
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.response?.data?.message || 'Failed to record cash payment');
      }
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Pay Worker Salary</h3>
              <p className="text-xs text-slate-400">Checkout &amp; Ledger Disbursal</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker Summary Banner */}
        <div className="px-6 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-800">{worker.worker?.name}</span>
            <span className="text-slate-500 ml-2">({worker.worker?.role || 'Worker'})</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Current Net Payable: </span>
            <span className="font-bold text-orange-700 text-sm">₹{worker.netPayable?.toLocaleString()}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePay} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMethod('Netbanking')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'Netbanking'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 ring-2 ring-blue-600/30 font-semibold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Landmark className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Netbanking</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('PhonePe')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'PhonePe'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-800 ring-2 ring-purple-600/30 font-semibold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span className="text-xs">PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('Cash')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'Cash'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-600/30 font-semibold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Cash</span>
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

          {/* Netbanking: Bank Selection Dropdown */}
          {method === 'Netbanking' && (
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                  <Landmark className="w-4 h-4 text-blue-700" />
                  <span>Select Bank Portal</span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Status: Pending Verification
                </span>
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

              <p className="text-[11px] text-blue-800 leading-relaxed">
                Clicking <strong>"Proceed to Netbanking"</strong> will open the <strong>{selectedBank.name}</strong> portal in a new tab and mark this payment as <strong className="text-amber-700">Pending</strong> on the dashboard. You can confirm it in 1-click once the transfer is completed.
              </p>
            </div>
          )}

          {/* PhonePe Specific Fields */}
          {method === 'PhonePe' && (
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                  <Smartphone className="w-4 h-4 text-purple-700" />
                  <span>PhonePe UPI Transfer</span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Status: Pending Verification
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Receiver PhonePe Number / VPA
                </label>
                <input
                  type="text"
                  value={phonePeNumber}
                  onChange={(e) => setPhonePeNumber(e.target.value)}
                  placeholder="+91 9876543201"
                  className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  required
                />
                <p className="text-[11px] text-purple-700 mt-1">
                  Will open PhonePe in a new tab and mark payment as <strong className="text-amber-700">Pending</strong> until confirmed.
                </p>
              </div>
            </div>
          )}

          {/* Cash Specific Fields */}
          {method === 'Cash' && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span>Direct Cash Disbursement</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Instant Paid
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Disbursement Note / Voucher Details
                </label>
                <input
                  type="text"
                  value={cashNotes}
                  onChange={(e) => setCashNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-emerald-700 mt-1">
                  Immediately records payment as <strong className="text-emerald-700">Paid</strong> and updates the worker's status badge.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {method === 'Netbanking'
                      ? 'Proceed to Netbanking'
                      : method === 'PhonePe'
                      ? 'Proceed with PhonePe'
                      : 'Pay via Cash'}
                  </span>
                  {method === 'Cash' ? (
                    <ArrowRight className="w-4 h-4" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
